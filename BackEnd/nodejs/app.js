const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const multer = require('multer');
const { URLSearchParams } = require('url');
const path = require('path');

// Express 애플리케이션 설정
const app = express();
app.use(cors()); // CORS 미들웨어 추가

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: 'moreburger-database.cz0oi80og7ce.ap-northeast-2.rds.amazonaws.com',
  user: 'moreburger_admin',
  password: 'kakao-moreburger-admin',
  database: 'cloud_test'
});

// 데이터베이스 연결 테스트
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  } else {
    console.log('Connected to the database.');
  }
});

// AWS S3 설정
const s3 = new AWS.S3({
  accessKeyId: 'AKIATCKASPM57Y7CUNR6', // AWS IAM 사용자 액세스 키
  secretAccessKey: 'qCMKpzFRDZOZCfymKQeeb9MZ8RGlnVyGfLAB9p0I', // AWS IAM 사용자 비밀 액세스 키
  region: 'ap-northeast-2', // S3 버킷이 위치한 리전
});

// Multer 설정 - 메모리에 파일을 저장
const upload = multer({ storage: multer.memoryStorage() });

// 기본 라우트
app.get('/getData', (req, res) => {
  res.send('Hello from Node.js!');
});

// 데이터 조회 라우트
app.get('/getData/getDB', (req, res) => {
  const query = 'SELECT * FROM new_table';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('쿼리 실행 오류:', err);
      res.status(500).send('서버 오류');
      return;
    }
    res.json(results); // 조회된 데이터를 클라이언트에게 JSON 형식으로 반환합니다.
  });
});

// 이미지 업로드 라우트
app.post('/getData/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  const s3Bucket = 'kakao-moreburger-backend';

  // S3 업로드 파라미터 설정
  const params = {
    Bucket: s3Bucket,
    Key: `${Date.now()}_${path.basename(file.originalname)}`, // 파일명에 타임스탬프 추가
    Body: file.buffer,
    ContentType: file.mimetype
  };

  // S3에 파일 업로드
  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading to S3:', err);
      return res.status(500).send('Error uploading file');
    }

    // URLSearchParams를 사용하여 업로드된 파일 URL을 생성
    const imageUrl = new URLSearchParams({ url: data.Location });

    // 업로드된 이미지의 URL을 반환
    res.json({ message: 'File uploaded successfully', imageUrl: imageUrl.toString() });
  });
});

// 서버 시작
const port = 8080;
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});
