import React, { useState, useEffect } from "react";
import { Button, Card, Alert, Container } from "react-bootstrap";
import { InboxOutlined } from "@ant-design/icons";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Base } from "../common/Base";
import { Form, Table, Tag, message } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { storage, firestore } from "../firebase";
import { verifyDocumentAPI } from "../apis/verify.api";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState();
  const [documentName, setDocumentName] = useState();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState();
  const history = useHistory();
  useEffect(() => {
    if (currentUser?.email === "admin@gmail.com") {
      history.push("/admin");
    }
  }, [currentUser, history]);
  const columns = [
    {
      title: "File",
      key: "file",
      render: (row) => (
        <a target="blank" href={row.fileLink}>
          {row.fileName}
        </a>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (row) => {
        return row.status === true ? (
          <Tag color="green">Verified</Tag>
        ) : (
          <Tag color="red">Unverified</Tag>
        );
      },
    },
    {
      title: "Document Type",
      key: "documentType",
      render: (row) => {
        return row.documentType ? (
          <Tag color="blue">{row.documentType}</Tag>
        ) : (
          <Tag color="yellow">Not Available</Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (row) => {
        return (
          <>
            <Button
              variant="outline-success"
              onClick={() => {
                handleVerify(row.fileLink);
              }}
              className="mx-3"
              disabled={row.status}>
              Verify
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => {
                handleDeleteDocument(row.fileLink);
              }}>
              Delete
            </Button>
          </>
        );
      },
    },
  ];
  useEffect(() => {
    if (documentUrl) {
      addDocument();
    }
  }, [documentUrl]);
  useEffect(() => {
    getUserData();
  }, []);
  const getUserData = async () => {
    setLoading(true);
    const userRef = firestore.collection("users").doc(currentUser.uid);
    const user = await userRef.get();
    setUserData(user.data());
    setLoading(false);
  };
  const handleVerify = (fileLink) => {
    setLoading(true);
    verifyDocumentAPI(fileLink)
      .then(async (res) => {
        if (res.status === true) {
          message.success("Document is verified");
          const userRef = firestore.collection("users").doc(currentUser.uid);
          const user = await userRef.get();
          const userData = user.data();
          const documentList = userData.documentList.map((document) => {
            if (document.fileLink === fileLink) {
              document.status = true;
              document.documentType = res.doc_type;
            }
            return document;
          });
          userData.documentList = documentList;
          userRef.set(userData);
          getUserData();
        } else {
          message.error("Document is not verified");
        }
      })
      .catch((err) => {
        message.error("Error while verifying document");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleDeleteDocument = async (fileLink) => {
    setLoading(true);
    const userRef = firestore.collection("users").doc(currentUser.uid);
    const user = await userRef.get();
    const userData = user.data();
    const documentList = userData.documentList.filter(
      (document) => document.fileLink !== fileLink,
    );
    userData.documentList = documentList;

    userRef.set(userData);
    getUserData();
  };
  const addDocument = async () => {
    setUserData(null);
    const userRef = firestore.collection("users").doc(currentUser.uid);
    const user = await userRef.get();
    if (user.exists) {
      userRef.update({
        documentList: [
          ...user.data().documentList,
          { fileLink: documentUrl, fileName: documentName, status: false },
        ],
      });
    } else {
      userRef.set({
        email: currentUser.email,
        documentList: [
          { fileLink: documentUrl, fileName: documentName, status: false },
        ],
      });
    }
    setDocumentUrl(null);
    setDocumentName(null);
    getUserData();
  };
  const handleDocumentUpload = (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const document = file;
    setDocumentName(null);
    setDocumentUrl(null);
    setLoading(true);
    const ref = storage.ref("Documents/");
    const docRef = ref.child(document.name);
    var metadata = {
      contentType: document.type,
    };
    docRef.put(document, metadata).on(
      "state_changed",
      (snap) => {
        console.log(snap);
      },
      (err) => {
        console.log(err);
      },
      () => {
        storage
          .ref("Documents/")
          .child(document.name)
          .getDownloadURL()
          .then((fireBaseUrl) => {
            setDocumentName(document.name);
            setDocumentUrl(fireBaseUrl);
            setLoading(false);
            message.success("File uploaded successfully");
          });
      },
    );
  };
  return (
    <>
      <Base container={false}>
        <Container className="my-5">
          <Form>
            <Form.Item>
              <Dragger
                name="document"
                listType="picture-card"
                showUploadList={false}
                customRequest={handleDocumentUpload}>
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag any file to this area to verify
                  </p>
                  <p className="ant-upload-hint">
                    Try to upload a file to verify your document
                  </p>
                </>
              </Dragger>
            </Form.Item>
          </Form>
          <h3>Document List</h3>
          <Table
            columns={columns}
            loading={loading}
            dataSource={userData?.documentList}
          />
        </Container>
      </Base>
    </>
  );
}
