import { Nav, Navbar, Container } from 'react-bootstrap'
import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../App.jsx'
import { useGetUserQuery } from "../stores/backendAPI";

function NavBar() {
    const [navbar, setNavbar] = useState(null)
    const { Secret, user, setUser, removeCookie } = useContext(UserContext);
    const { data, isSuccess, refetch } = useGetUserQuery({ 'Secret': Secret });
    useEffect(() => {
        if (isSuccess && data.message === "Get user success") {
            setUser(data.data);
        }
        return () => {
            refetch()
        }
    }, [data])

    function logout() {
        window.location.href = "/"
        removeCookie('user')
    }

    useEffect(() => {
        if (user) {
            setNavbar(<Nav.Link key="logout" href="/" onClickCapture={logout} >Logout</Nav.Link>)
        } else {
            setNavbar([<Nav.Link key="/register" href="/register">Register</Nav.Link>,
            <Nav.Link key="login" href="/login" >Login</Nav.Link>])
        }
    }, [user])

    return (
        <div>
            <Container>
                <Navbar fixed='top' bg="dark" variant="dark" expand="lg">
                    <Navbar.Brand href="/" style={{ width: '5%' }} >
                        Home
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto justify-content-end"
                            style={{ maxHeight: '100px', width: '100%' }}
                            navbarScroll
                        >
                            {navbar}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Container>
        </div>
    )
}

export default NavBar