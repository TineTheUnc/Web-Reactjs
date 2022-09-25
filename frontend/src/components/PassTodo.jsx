import { React, useState, useContext, useEffect, useRef } from "react";
import { Button, ButtonGroup, Form, Row, Col } from 'react-bootstrap'
import { UserContext } from '../App.jsx'

function PassTodo(props) {
    const { Secret, cookies, setError } = useContext(UserContext);
    const [passlist] = props
    const Password = useRef(null);
    const Key = useRef(null);
    const PL = useGetPasslistQuery({ 'Secret': Secret, 'Cookies': cookies['user'] })


    // function EditPasslist(event) {
    //     const plid = event.target.getAttribute('plid')
    //     const input1 = document.getElementsByName("Key-Password-" + plid)[0]
    //     const input2 = document.getElementsByName("Passlist-Password-" + plid)[0]
    //     input1.select()
    //     input1.setSelectionRange(0, 99999)
    //     navigator.clipboard.writeText(input1.value)
    // }

    async function FormSubmit(event) {
        event.preventDefault();
        const input = document.getElementsByName("Password")[0];
        if (Password.current.value && Key.current.value) {
            input.setCustomValidity("Please input all");
            addPasslist({ 'Key': Key.current.value, 'Password': Password.current.value, 'Secret': Secret, 'Cookies': cookies['user'] }).then((response) => {
                if (response.data.message === "Add Passlist succeed") {
                    PL.refetch()
                } else {
                    if (Object.keys(response.data.error).toString().includes("message")) {
                        console.error(response.data.error)
                        setError({ "error": "500", "message": "unknown error" })
                    } else {
                        if (Object.keys(response.data.error).length === 0) {
                            setError({ "error": "500", "message": response.data.message });
                        } else {
                            setError({ "error": response.data.error, "message": response.data.message });
                        }
                    }
                }
            }).catch((error) => {
                console.error(error)
                setError({ "error": "500", "message": error.message });
            })
        } else {
            input.setCustomValidity("Please input all");
        }
    }

    function CoppyPassword(event) {
        const plid = event.target.getAttribute('plid')
        const input = document.getElementsByName("Passlist-Password-" + plid)[0]
        input.select()
        input.setSelectionRange(0, 99999)
        navigator.clipboard.writeText(input.value)
    }
    return (
        <div key={"Passlist-" + passlist.ID}>
            <Form className="form-horizontal form" onSubmit={FormSubmit}>
                <Row className="align-items-center">
                    <Col xs="auto" className="my-1">
                        <Form.Label className="label" >Key:</Form.Label>
                    </Col>
                    <Col xs="auto" className="my-1">
                        <Form.Control type="text" placeholder="Key" name={"Passlist-Key-" + passlist.ID} maxLength="100" required onChange={CkeckText} readOnly={false} defaultValue={passlist.Key} />
                    </Col>
                    <Col xs="auto" className="my-1">
                        <Form.Label className="label">Password:</Form.Label>
                    </Col>
                    <Col xs="auto" className="my-1">
                        <Form.Control type="password" placeholder="Password" name={"Passlist-Password-" + passlist.ID} ref={Password} maxLength="100" required onChange={CkeckText} readOnly defaultValue={passlist.Password} />
                    </Col>
                    <Col xs="auto" className="my-1">
                        <ButtonGroup >
                            <Button type="button" name="Coppy" plid={passlist.ID} onClick={CoppyPassword} ><Icon.CircleSquare /></Button>
                            <Button type="button" name="edit" plid={passlist.ID}><Icon.PencilSquare /></Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default PassTodo