import React, { Fragment, useState } from "react";
import Message from "./Message";
import Progress from "./Progress";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState("");
  const [fileSize, invalidSize] = useState(false);
  const [filename, setFilename] = useState("Choose File");
  const [pageType, setPage] = useState("1");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const imageInputRef = React.useRef();
  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
    var _URL = window.URL || window.webkitURL;
    var file, img;

    if ((file = e.target.files[0])) {
      img = new Image();
      img.onload = function () {
        if (this.width !== 1024 && this.height !== 1024) {
          invalidSize(true);
          imageInputRef.current.value = "";
          setFile(null);
          setFilename(null);
          setUploadedFile(null);
          setTimeout(function () {
            invalidSize(false);
          }, 5000);
        }
        // alert(this.width + " " + this.height);
      };
      img.onerror = function () {
        alert("not a valid file: " + file.type);
      };

      img.src = _URL.createObjectURL(file);
    }
  };

  const convertImage = (value) => {
    setPage(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );

          // Clear percentage
          setTimeout(() => setUploadPercentage(0), 10000);
        },
      });

      const { fileName, filePath } = res.data;

      setUploadedFile({ fileName, filePath });

      setMessage("File is Uploaded");
    } catch (err) {
      if (err.response.status === 500) {
        setMessage("There was a problem with the server");
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };

  return (
    <div>
      {pageType === "1" && (
        <Fragment>
          {message ? <Message msg={message} /> : null}
          <form onSubmit={onSubmit}>
            <div className="custom-file mb-4">
              <input
                type="file"
                className="custom-file-input"
                id="customFile"
                onChange={onChange}
                ref={imageInputRef}
              />
              <label className="custom-file-label" htmlFor="customFile">
                {filename}
              </label>
              {fileSize && (
                <div className="errorClass">
                  Incorrect File Size. Only 1024*1024 file size is accepted.
                </div>
              )}
            </div>

            <Progress percentage={uploadPercentage} />
            <input
              type="submit"
              value="Upload"
              className="btn btn-primary btn-block mt-4"
            />
          </form>
          {uploadedFile && (
            <button
              type="submit"
              className="btn btn-dark btn-block mt-4"
              onClick={() => convertImage("2")}
            >
              Convert
            </button>
          )}
          {uploadedFile ? (
            <div className="row mt-5 mb-5">
              <div className=" m-auto">
                <h3 className="text-center">{uploadedFile.fileName}</h3>
                <img src={uploadedFile.filePath} alt="" />
              </div>
            </div>
          ) : null}
        </Fragment>
      )}

      {pageType === "2" && uploadedFile && (
        <div className="imageConvertDiv mb-5">
          <div className="col-md-6 m-auto">
            <h3 className=" imageName">
              Horizontal : 755 x 450 {uploadedFile.fileName}
            </h3>
            <img src={uploadedFile.filePath} alt="" className="horizontal" />
          </div>
          <div className="col-md-6 m-auto">
            <h3 className=" imageName">
              Vertical : 365 x 450 {uploadedFile.fileName}
            </h3>
            <img src={uploadedFile.filePath} alt="" className="vertical" />
          </div>
          <div className="col-md-6 m-auto">
            <h3 className=" imageName">
              Horizontal small : 365 x 212 {uploadedFile.fileName}
            </h3>
            <img
              src={uploadedFile.filePath}
              alt=""
              className="horizontalSmall"
            />
          </div>
          <div className="col-md-6 m-auto">
            <h3 className="imageName">
              Gallery : 380 x 380 {uploadedFile.fileName}
            </h3>
            <img src={uploadedFile.filePath} alt="" className="gallery" />
          </div>
          <button
            type="button"
            class="btn btn-primary btn-block mt-4"
            onClick={() => convertImage("1")}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
