#[macro_use]
extern crate lazy_static;

use rocksdb::{OptimisticTransactionDB, WriteBatchWithTransaction, DB};
use schema::{DBValue, UserUpdate, UserUpdates};
use shi_server::shi_service_server::{ShiService, ShiServiceServer};
use shi_server::{
    UpdateCodeRequest, UpdateRequest, User, UsersRequest, UsersResponse, WriteOutcome, WriteStatus,
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
        Shi {
            db: OptimisticTransactionDB::open_default(path).unwrap(),
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
        let code_iter = self.db.prefix_iterator(b"//code");

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

        println!("{:?}", &req.updates);
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
        schema::update(&tx, schema, &updates).unwrap();

        let outcome = match tx.commit() {
            Ok(()) => WriteOutcome::Success,
            Err(_) => WriteOutcome::Failure,
        };

        Ok(Response::new(WriteStatus {
            outcome: outcome.into(),
        }))
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
