#[macro_use]
extern crate lazy_static;

use rocksdb::{OptimisticTransactionDB, WriteBatchWithTransaction, DB, SliceTransform, Options};
use schema::{DBValue, UserUpdate, UserUpdates};
use shi_server::shi_service_server::{ShiService, ShiServiceServer};
use shi_server::{
    UpdateRequest, User, UsersRequest, UsersResponse, WriteOutcome, WriteStatus,
};
use tonic::{transport::Server, Request, Response, Status};

mod schema;

pub mod shi_server {
    tonic::include_proto!("shi");
}

pub struct Shi {
    db: OptimisticTransactionDB,
}

impl Shi {
    pub fn new() -> Self {
        let path = "shi_db";
	let prefix_extractor = SliceTransform::create("path_prefix", index_prefix_extractor, None);
	let mut opts = Options::default();
	opts.create_if_missing(true);
	opts.set_prefix_extractor(prefix_extractor);

        Shi {
            db: OptimisticTransactionDB::open(&opts, &path).unwrap(),
        }
    }
}

fn get_index(v: &str, occurrence: usize, value: char) -> Option<usize> {
    v.chars()
        .enumerate()
        .filter(|(_, v)| *v == value)
        .map(|(i, _)| i)
        .nth(occurrence - 1)
}

fn index_prefix_extractor(k: &[u8]) -> &[u8] {
    let str = String::from_utf8(k.to_vec()).unwrap();
    match get_index(str.as_str(), 3, '/') {
	Some(idx) => {
	    &k[..idx]
	},
	None => {
	    k
	}
    }
}

#[tonic::async_trait]
impl ShiService for Shi {
    async fn get_users(
        &self,
        _request: Request<UsersRequest>,
    ) -> Result<Response<UsersResponse>, Status> {
        let mut users = vec![];
        let code_iter = self.db.prefix_iterator(b"//index@code/");

        for item in code_iter {
            let (key, value) = item.unwrap();
            let code: DBValue = rmp_serde::from_slice(value.into_vec().as_slice()).unwrap();

            users.push(User {
                id: String::from_utf8(key.into_vec()).unwrap(),
                code: format!("{:?}", code),
            })
        }

        let reply = UsersResponse { users };

        Ok(Response::new(reply))
    }

    async fn update(
        &self,
        request: Request<UpdateRequest>,
    ) -> Result<Response<WriteStatus>, Status> {
        let req = request.get_ref();

        let schema = match req.schema.as_str() {
            "user" => &schema::UserSchema,
            _ => {
                return Ok(Response::new(WriteStatus {
                    outcome: WriteOutcome::UnknownSchema.into(),
                }))
            }
        };

        let updates_list = &req.updates;
        let mut ul = vec![];

        for update in updates_list {
            ul.push(UserUpdate {
                field: schema::UserField::Code,
                value: DBValue::Str("HOLA".to_string()),
            })
        }

        let tx = self.db.transaction();

        let updates = UserUpdates {
            id: "Testillo".to_string(),
            updates: ul,
        };
        match schema::update(&tx, schema, &updates) {
	    Ok(_) => {
		let outcome = match tx.commit() {
		    Ok(()) => WriteOutcome::Success,
		    Err(_) => WriteOutcome::Failure,
		};

		Ok(Response::new(WriteStatus {
		    outcome: outcome.into(),
		}))
	    },
	    Err(_) => {
		let outcome = match tx.rollback() {
		    Ok(_) => WriteOutcome::InternalError,
		    Err(_) => WriteOutcome::InternalError,
		};

		Ok(Response::new(WriteStatus {
		    outcome: outcome.into(),
		}))
	    }
	}

    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "127.0.0.1:50051".parse().unwrap();
    let shi = Shi::new();

    println!("Starting server at {:?}", addr);
    Server::builder()
        .add_service(ShiServiceServer::new(shi))
        .serve(addr)
        .await?;

    Ok(())
}
