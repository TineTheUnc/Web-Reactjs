import { React, useRef, useState, useContext } from "react";
import { Button, ButtonGroup, Form, Row, Col, Modal } from 'react-bootstrap'
import { useDeletePasslistMutation } from "./../stores/backendAPI.jsx"
import * as Icon from 'react-bootstrap-icons'
import { UserContext } from '../App.jsx'


function PassTodo(props) {
    const {cookies, Secret, setError} = useContext(UserContext);
    const { passlist, Refetch } = props
    const Password = useRef(null);
    const [deletePasslist] = useDeletePasslistMutation()
    const Key = useRef(null);
    const [DeleteButtonShow, setDeleteButtonShow] = useState(false);

    

    async function DeletePasslistButton() {
        deletePasslist({ 'ID': passlist.ID, "Secret": Secret , "Cookies": cookies['user']}).then((response) => {
            if (response.data.message == "Delete Passlist succeed") {
                setDeleteButtonShow(false)
                Refetch()
            } else {
                if (Object.keys(response.data.error).toString().includes("message")) {
                    console.error(response.data.error)
                    setDeleteButtonShow(false)
                    setError({ "error": "500", "message": "unknown error" })
                } else {
                    if (Object.keys(response.data.error).length === 0) {
                        setDeleteButtonShow(false)
                        setError({ "error": "500", "message": response.data.message });
                    } else {
                        setDeleteButtonShow(false)
                        setError({ "error": response.data.error, "message": response.data.message });
                    }
                }
            }
        }).catch((error) => {
            console.error(error)
            setDeleteButtonShow(false)
            setError({ "error": "500", "message": error.message });
        })
    }

    function CoppyPassword(event) {
        const plid = event.target.getAttribute('plid')
        const input = document.getElementsByName("Passlist-Password-" + plid)[0]
        navigator.clipboard.writeText(input.value)
    }
    return (
        <div key={"Passlist-" + passlist.ID}>
            <Form className="form-horizontal form">
                <Row className="align-items-center">
                    <Col xs="auto" className="my-1">
                        <Form.Label className="label" >Key:</Form.Label>
                    </Col>
                    <Col xs="auto" className="my-1">
                        <Form.Control type="text" placeholder="Key" name={"Passlist-Key-" + passlist.ID} maxLength="100" ref={Key} required  readOnly defaultValue={passlist.Key} />
                    </Col>
                    <Col xs="auto" className="my-1">
                        <Form.Label className="label">Password:</Form.Label>
                    </Col>
                    <Col xs="auto" className="my-1">
                        <Form.Control type="password" placeholder="Password" name={"Passlist-Password-" + passlist.ID} ref={Password} maxLength="100" required readOnly defaultValue={passlist.Password} />
                    </Col>
                    <Col xs="auto" className="my-1">
                        <ButtonGroup >
                            <Button type="button" name="Coppy" key="CoppyButton" plid={passlist.ID} onClick={CoppyPassword} ><Icon.CircleSquare /></Button>
                            <Button type="button" name="delete" key="DeleteButton" plid={passlist.ID} variant="danger" onClick={() => setDeleteButtonShow(true)}><Icon.TrashFill /></Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Form>

            <Modal show={DeleteButtonShow} backdrop="static" keyboard={false} centered>
                <Modal.Header >
                    <Modal.Title className="text-center">ถามความมั้นใจ</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <h1>คุณแน่ใจหรือไม่ที่จะลบรายการนี้</h1>
                    <ButtonGroup >
                        <Button type="button" name="edit" plid={passlist.ID} variant="success" onClick={DeletePasslistButton}>ตกลง</Button>
                        <Button type="button" name="edit" plid={passlist.ID} variant="danger" onClick={()=>setDeleteButtonShow(false)}>ยกเลิก</Button>
                    </ButtonGroup>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default PassTodo