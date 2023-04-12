import React, { useState, useEffect } from "react";
import { Button, Card, Alert, Container } from "react-bootstrap";
import { InboxOutlined } from "@ant-design/icons";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Base } from "../common/Base";
import { Form, Table, Tag, message } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { storage, firestore } from "../firebase";

export default function Dashboard() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState();
  const [documentName, setDocumentName] = useState();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState();
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
    console.log(user.data());
    setUserData(user.data());
    setLoading(false);
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
    getUserData();
  };
  const handleDocumentUpload = (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const document = file;
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
