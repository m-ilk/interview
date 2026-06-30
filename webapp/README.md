# Image Upload and Compression API

NodeJS/Express for image upload/compress and history API

## Features

Image Upload and Compression Endpoint
- Allows users to upload an image and provides a compressed version of that image.
Processing History Endpoint
- Returns the history of processed images.
- No database configuration is required.
- All storage must be in-memory only.


## Prerequisites

- Node.js 20+
- npm 11+

## Installation

```bash
cd interviewTest
npm install
```

## Usage

Start the server:

```bash
npm start
```

The API runs on `http://localhost:3000`.

## API Endpoints

### `POST /api/images/compress`

Upload one file with the field name `image`.

- Success: `200 OK`, binary response body
- Errors:
  - `400` missing file / invalid upload / non-image file / file size over 1MB
  - `500` compression failure
### Note on In-Memory Storage

Currently, the server uses array (`history`) to store metadata about processed uploads. This approach is safe and efficient only for a single-threaded Node.js process.

However, if we decide to scale the application horizontally (e.g., running multiple server instances or deploying in a cluster), or if we need data persistence across restarts, the `history`  can not be synchronize between other servers and 

In such cases, consider switching storage to a shared or persistent system(such as redis)

### `GET /api/images/history`

Returns in-memory history of processed uploads:
- `originalSize` and `compressedSize` are measured in bytes.

```json
{
  "history": [
    {
      "filename": "sample.png",
      "contentType": "image/png",
      "originalSize": 123456,
      "compressedSize": 45678,
      "uploadedAt": "xxxxxx"
    }
  ]
}
```

## Testing

For production-ready quality, this API should include automated integration tests and mock-based server/dependency tests.

For interview simplicity, this submission validates API behavior mainly through the REST request file:

- `test/image-api.rest`


## Assumptions

- Clients upload image files using `multipart/form-data` with field name `image`.
- Compressed output is `gzip` bytes.
- Processing history only stored meta data(`timestamps`, `original size`, `compressed size` ...etc) in memory only (not include the compressed data)and resets on server restart.

## Server Structure

```mermaid
flowchart TD
    A[Request] --> B[Route]
    B --> C[Middleware(upoad/validation middleware)]
    C --> D[Service]
    D --> E[Record History /Compress Image]
    E --> F[Send Response]
    D --> H[Error Handler]
    H --> I[Error Response]
```
For the sake of interview purpose i keep the code structure simple. However if it is for production code sturture. i would do it differently to  improve scalability, testability, and separation of concerns.

- Routes layer: Responsible only for defining API endpoints
- Controller layer: Handles HTTP request/response mapping, input/output shaping
- Service layer: where we do the business logic
- Middleware layer: Handles request validation, such as authentication, file validation, and error handling

