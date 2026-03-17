import os
from minio import Minio
from minio.error import S3Error


class Storage:
    def __init__(self) -> None:
        self.endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        self.bucket = os.getenv("MINIO_BUCKET", "videopro2")
        self.client = Minio(self.endpoint, access_key=self.access_key, secret_key=self.secret_key, secure=False)
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except S3Error:
            pass

    def put_file(self, local_path: str, object_name: str) -> str:
        self.client.fput_object(self.bucket, object_name, local_path)
        return f"/s3/{self.bucket}/{object_name}"


