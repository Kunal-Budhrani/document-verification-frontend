import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { Base } from "../common/Base";
import { firestore } from "../firebase";
import { Modal, Table, Tag, message } from "antd";
import { verifyDocumentAPI } from "../apis/verify.api";
import { Button } from "react-bootstrap";

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getVerifiedDocuments = (documents) => {
    return documents.filter((document) => document.status === true);
  };
  const getUnverifiedDocuments = (documents) => {
    return documents.filter((document) => document.status === false);
  };
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleVerify = (fileLink) => {
    setLoading(true);
    verifyDocumentAPI(fileLink)
      .then(async (res) => {
        if (res.status === true) {
          message.success("Document is verified");
          const userRef = firestore.collection("users").doc(selectedUser.id);
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
        } else {
          message.error("Document is not verified");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error("Error while verifying document");
      })
      .finally(() => {
        setLoading(false);
        // window.location.reload();
      });
  };
  const handleDeleteDocument = async (fileLink) => {
    setLoading(true);
    const userRef = firestore.collection("users").doc(selectedUser.id);
    const user = await userRef.get();
    const userData = user.data();
    const documentList = userData.documentList.filter(
      (document) => document.fileLink !== fileLink,
    );
    userData.documentList = documentList;
    userRef.set(userData);
    // window.location.reload();
  };

  const columns = [
    {
      title: "Email",
      key: "email",
      render: (row) => <p>{row.email}</p>,
    },
    {
      title: "Verified Documents",
      key: "verifiedDocuments",
      render: (row) => <p>{getVerifiedDocuments(row.documentList).length}</p>,
    },
    {
      title: "Unverified Documents",
      key: "unverifiedDocuments",
      render: (row) => <p>{getUnverifiedDocuments(row.documentList).length}</p>,
    },
    {
      title: "Total Documents",
      key: "documentList",
      render: (row) => <p>{row.documentList.length}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (row) => {
        return (
          <>
            <Button
              onClick={() => {
                setSelectedUser(row);
                setIsModalOpen(true);
              }}>
              View Documents
            </Button>
          </>
        );
      },
    },
  ];
  const userColumns = [
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
              // disabled={row.status}
            >
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
  const getUsers = async () => {
    const usersInFS = firestore.collection("users");
    const snapshot = await usersInFS.get();
    const usersData = snapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });
    setUsers(usersData);
    console.log("users", usersData);
  };
  useEffect(() => {
    getUsers();
  }, []);
  useEffect(() => {
    if (currentUser?.email !== "admin@gmail.com") {
      history.push("/");
    }
  }, [currentUser, history]);
  return (
    <Base container={false}>
      <div className="m-4">
        <h3>Admin Dashboard</h3>
        <hr />
        <Table dataSource={users} columns={columns} />
        <Modal
          width={1000}
          title="User Documents"
          open={isModalOpen}
          footer={null}
          onCancel={handleModalCancel}>
          <Table
            columns={userColumns}
            loading={loading}
            dataSource={selectedUser?.documentList}
          />
        </Modal>
      </div>
    </Base>
  );
};
