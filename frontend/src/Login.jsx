import { React, useState, useRef, useContext } from "react";
import { Form, Button, Row, Col, ButtonGroup } from 'react-bootstrap'
import "./Login.css"
import * as Icon from 'react-bootstrap-icons';
import { UserContext } from './App.jsx'
import { useLoginUserMutation } from './stores/backendAPI.jsx'


function Login() {
    const [loginUser] = useLoginUserMutation();
    const { Secret, setCookie, setError } = useContext(UserContext);
    const Email = useRef(null);
    const Password = useRef(null);
    const ConfirmPassword = useRef(null);
    const [Eye, setEye] = useState(<Icon.EyeSlashFill />)


    function ShowPassword() {
        const input1 = document.getElementsByName("Password")[0];
        const input2 = document.getElementsByName("ConfirmPassword")[0];
        if (input1.type === "password") {
            input1.type = "text";
            input2.type = "text";
            setEye(<Icon.EyeFill />)
        } else {
            input1.type = "password";
            input2.type = "password";
            setEye(<Icon.EyeSlashFill />)
        }
    }

    function CkeckText(event) {
        if (event.target.value.includes(" ") || event.target.value.includes(":") || event.target.value.includes(";") || event.target.value.includes(",")) {
            event.target.setCustomValidity("Can't use space or : or ; or , in your from");
        } else {
            event.target.setCustomValidity("");
        }
    }

    function FormSubmit(event) {
        event.preventDefault();
        if (Email.current.value && Password.current.value) {
            if (Password.current.value === ConfirmPassword.current.value) {
                const input = document.getElementsByName("Password")[0];
                input.setCustomValidity("");
                loginUser({ 'Email': Email.current.value, 'Password': Password.current.value, 'Secret': Secret }).then((response) => {
                    if (response.data.message === "Login success") {
                        setCookie("user", response.data.token, { path: '/', maxAge: 10800 });
                        window.location.href = `/profile`
                    } else {
                        if (Object.keys(response.data.error).toString().includes("message")) {
                            setError({ "error": "500", "message": "unknown error" })
                        } else {
                            setError({ "error": response.data.error, "message": response.data.message });
                        }
                    }
                }).catch((error) => {
                    setError({ "error": "500", "message": error.message });
                })
            } else {
                const input = document.getElementsByName("Password")[0];
                input.setCustomValidity("Password and Confirm Password does not match");
            }
        }
    }
    return (
        <Form className="form-horizontal form" onSubmit={FormSubmit}>


            <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="label">Email address</Form.Label>
                <Form.Control type="email" placeholder="Email" name="Email" ref={Email} maxLength="50" required onChange={CkeckText} />
            </Form.Group>

            <Row className="mb-3">
                <Form.Group as={Col} className="mb-3" controlId="formPassword">
                    <Form.Label className="label">Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" name="Password" ref={Password} required minLength="8" maxLength="50" onChange={CkeckText} />
                </Form.Group>

                <Form.Group as={Col} className="mb-3" controlId="formConfirmPassword">
                    <Form.Label className="label">Confirm Password</Form.Label>
                    <Form.Control type="password" placeholder="Confirm Password" name="ConfirmPassword" ref={ConfirmPassword} required minLength="8" maxLength="50" onChange={CkeckText} />
                </Form.Group>
                <ButtonGroup className="mb-3" >
                    <Button type="button" name="ShowPassword" onClick={ShowPassword} >{Eye}</Button>
                </ButtonGroup>
            </Row>

            <Button type="submit">Submit</Button>

        </Form>
    )
}

export default Login;