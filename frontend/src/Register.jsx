import { React, useState, useRef, useContext } from "react";
import { Form, Button, Row, Col, ButtonGroup } from 'react-bootstrap'
import "./Register.css"
import * as Icon from 'react-bootstrap-icons';
import { UserContext } from './App.jsx'
import { useGetRandomPasswordQuery, useCreateUserMutation } from './stores/backendAPI.jsx';

function Register() {
    const { data, error, isError, isSuccess, refetch } = useGetRandomPasswordQuery();
    const [createUser] = useCreateUserMutation();
    const { Secret, setError } = useContext(UserContext);
    const FirstName = useRef(null);
    const LastName = useRef(null);
    const Email = useRef(null);
    const Password = useRef(null);
    const ConfirmPassword = useRef(null);
    const [Eye, setEye] = useState(<Icon.EyeSlashFill />)
    const [Dice, setDice] = useState({ "Number": 1, "Icon": <Icon.Dice1Fill /> })

    function RandomPassword() {
        refetch()
        if (isSuccess) {
            const input1 = document.getElementsByName("Password")[0];
            const input2 = document.getElementsByName("ConfirmPassword")[0];
            input1.type === "password"
            input2.type === "password"
            input1.value = data.password;
            input2.value = data.password;
            if (Dice.Number === 1) {
                setDice({ "Number": 2, "Icon": <Icon.Dice2Fill /> })
            } else if (Dice.Number === 2) {
                setDice({ "Number": 3, "Icon": <Icon.Dice3Fill /> })
            } else if (Dice.Number === 3) {
                setDice({ "Number": 4, "Icon": <Icon.Dice4Fill /> })
            } else if (Dice.Number === 4) {
                setDice({ "Number": 5, "Icon": <Icon.Dice5Fill /> })
            } else if (Dice.Number === 5) {
                setDice({ "Number": 6, "Icon": <Icon.Dice6Fill /> })
            } else {
                setDice({ "Number": 1, "Icon": <Icon.Dice1Fill /> })
            }
        } else if (isError) {
            setError({ "error": "500", "message": error.message })
        }
    }

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
        if (FirstName.current.value && LastName.current.value && Email.current.value && Password.current.value) {
            if (Password.current.value === ConfirmPassword.current.value) {
                const input = document.getElementsByName("Password")[0];
                input.setCustomValidity("")
                createUser({ 'FirstName': FirstName.current.value, 'LastName': LastName.current.value, 'Email': Email.current.value, 'Password': Password.current.value, 'Secret': Secret }).then((response) => {
                    if (response.data.messag === "Register succeed") {
                        setTimeout(() => {
                            window.location.href = "/login";
                        }, 1000);
                    } else {
                        console.error(response.data);
                        if (Object.keys(response.data.error).toString().includes("message")) {
                            console.error(response.data.error)
                            setError({ "error": "500", "message": "DB error" })
                        } else {
                            console.log(response.data.error)
                            setError({ "error": response.data.error, "message": response.data.message });
                        }
                    }
                }).catch((error) => {
                    console.error(error)
                    setError({ "error": "500", "message": error.message });
                })
            } else {
                const input = document.getElementsByName("Password")[0];
                input.setCustomValidity("Password and Confirm Password does not match")
            }
        } else {
            const input = document.getElementsByName("FirstName")[0];
            input.setCustomValidity("Please input all");
        }
    }
    
    return (
        <Form className="form-horizontal form" onSubmit={FormSubmit}>

            <Row className="mb-3">
                <Form.Group as={Col} className="mb-3" controlId="formFirstName">
                    <Form.Label className="label">First Name</Form.Label>
                    <Form.Control type="text" placeholder="First Name" name="FirstName" ref={FirstName} maxLength="100" required onChange={CkeckText} />
                </Form.Group>

                <Form.Group as={Col} className="mb-3" controlId="formLastName">
                    <Form.Label className="label">Last Name</Form.Label>
                    <Form.Control type="text" placeholder="Last Name" name="LastName" ref={LastName} maxLength="100" required onChange={CkeckText} />
                </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="label">Email address</Form.Label>
                <Form.Control type="email" placeholder="Email" name="Email" ref={Email} maxLength="50" required onChange={CkeckText} />
            </Form.Group>

            <Row className="mb-3">
                <Form.Group as={Col} className="mb-3" controlId="formPassword">
                    <Form.Label className="label">Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" name="Password" ref={Password} required minlength="8" maxLength="50" onChange={CkeckText} />
                </Form.Group>

                <Form.Group as={Col} className="mb-3" controlId="formConfirmPassword">
                    <Form.Label className="label">Confirm Password</Form.Label>
                    <Form.Control type="password" placeholder="Confirm Password" name="ConfirmPassword" ref={ConfirmPassword} required minlength="8" maxLength="50" onChange={CkeckText} />
                </Form.Group>
                <ButtonGroup className="mb-3" >
                    <Button type="button" name="ShowPassword" onClick={ShowPassword} >{Eye}</Button>
                    <Button type="button" name="RandomPassword" onClick={RandomPassword} >{Dice.Icon}</Button>
                </ButtonGroup>
            </Row>

            <Button type="submit" variant="success">Submit</Button>

        </Form>
    )
}

export default Register;