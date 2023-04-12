import { React } from "react";
// import { Footer } from "./Footer";
import Header from "./Header";
import { Container } from "react-bootstrap";
export const Base = ({ children, container = true }) => {
  return (
    <>
      <Header />
      {container ? (
        <Container
          className="d-flex align-items-center justify-content-center "
          style={{ minHeight: "100vh" }}>
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <main>{children}</main>
          </div>
        </Container>
      ) : (
        <main>{children}</main>
      )}
      {/* <Footer /> */}
    </>
  );
};
