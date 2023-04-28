use anyhow::Result;
use rocksdb::{OptimisticTransactionDB, Transaction};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::hash::Hash;

#[derive(Serialize, Deserialize, Debug)]
struct DBCode {
    user_id: String,
    code: String,
}

pub trait DBFields: PartialEq + Eq + Hash {}

#[derive(PartialEq, Eq, Hash)]
pub enum UserField {
    Id,
    Name,
    Password,
    Code,
}
impl DBFields for UserField {}

#[derive(Serialize, Deserialize, Debug)]
pub enum DBValue {
    Str(String),
    Int(i64),
    Bytes(Vec<u8>),
}

pub struct DBUpdate<T> {
    pub field: T,
    pub value: DBValue,
}

pub type UserUpdate = DBUpdate<UserField>;

pub struct DBUpdates<T> {
    pub id: String,
    pub updates: Vec<DBUpdate<T>>,
}

pub type UserUpdates = DBUpdates<UserField>;

pub struct SchemaIndexDef {
    pub prefix: &'static str,
}

pub struct SchemaFieldDef {
    pub name: &'static str,
    pub index: Option<SchemaIndexDef>,
}

pub struct Schema<F: DBFields> {
    pub prefix: &'static str,
    pub id: F,
    pub fields: HashMap<F, SchemaFieldDef>,
}

lazy_static! {
    pub static ref UserSchema: Schema<UserField> = {
        let mut m = HashMap::new();
        m.insert(
            UserField::Id,
            SchemaFieldDef {
                name: "id",
                index: None,
            },
        );
        m.insert(
            UserField::Name,
            SchemaFieldDef {
                name: "name",
                index: None,
            },
        );
        m.insert(
            UserField::Password,
            SchemaFieldDef {
                name: "password",
                index: None,
            },
        );
        m.insert(
            UserField::Code,
            SchemaFieldDef {
                name: "code",
                index: Some(SchemaIndexDef { prefix: "//index@code" }),
            },
        );

        Schema {
            prefix: "//table@user",
            id: UserField::Id,
            fields: m,
        }
    };
}

fn get_last_idx(tx: &Transaction<OptimisticTransactionDB>, path: &Vec<u8>) -> i64 {
    match tx.get(path) {
        Ok(Some(data)) => match rmp_serde::from_slice(data.as_slice()) {
            Ok(DBValue::Int(val)) => val,
            _ => panic!("Saved value of index is not of type Int"),
        },
        Ok(None) => 0,
        Err(_) => {
            panic!("Error reading from index");
        }
    }
}

fn next_idx(tx: &Transaction<OptimisticTransactionDB>, path: Vec<u8>) -> Result<i64> {
    let last_idx = get_last_idx(tx, &path);
    let new_idx = last_idx + 1;
    let new_value = rmp_serde::to_vec(&DBValue::Int(new_idx))?;
    tx.put(&path, new_value)?;
    return Ok(new_idx);
}

pub fn update<T: DBFields>(
    tx: &Transaction<OptimisticTransactionDB>,
    schema: &Schema<T>,
    args: &DBUpdates<T>,
) -> Result<()> {
    for update in &args.updates {
        update_field(tx, schema, &args.id, &update.field, &update.value)?;
    }

    Ok(())
}

/// Update a field for item with the given id.
/// Uses the given schema to know what to update.
fn update_field<T: DBFields>(
    tx: &Transaction<OptimisticTransactionDB>,
    schema: &Schema<T>,
    id: &str,
    field: &T,
    value: &DBValue,
) -> Result<()> {
    let field_def = schema.fields.get(field).unwrap();

    let base_path = format!("{}/{}/{}", schema.prefix, id, field_def.name);
    let idx_path = format!("{}/last_idx", base_path);
    let latest_path = format!("{}/latest", base_path);

    let new_idx = next_idx(tx, idx_path.into_bytes())?;

    let value_path = format!("{}/{}", base_path, new_idx);
    let value = rmp_serde::to_vec(value).unwrap();
    tx.put(value_path.into_bytes(), &value)?;
    tx.put(latest_path.into_bytes(), &value)?;

    if let Some(index_def) = &field_def.index {
        let path = format!("{}/{}", index_def.prefix, id).into_bytes();
        tx.put(path, &value)?;
    }

    Ok(())
}
