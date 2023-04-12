import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const Header = () => {
  const history = useHistory();
  const { currentUser, logout } = useAuth();
  return (
    <>
      <Navbar bg="dark" expand="lg" variant="dark">
        <Container fluid>
          <Navbar.Brand
            onClick={() => {
              history.push("/");
            }}
            style={{ cursor: "pointer" }}>
            Website Name
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            {currentUser && (
              <Nav
                className="me-auto m-2 my-lg-0"
                style={{ maxHeight: "100px" }}
                navbarScroll>
                <Button
                  variant="secondary"
                  onClick={() => {
                    logout();
                  }}>
                  Logout
                </Button>
                <Link to="/update-profile" className="mx-3 btn btn-primary">
                  Update Profile
                </Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
