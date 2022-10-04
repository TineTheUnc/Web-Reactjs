import { React, useState, useContext, useEffect, useRef } from "react";
import {
    useGetUserQuery, useUpdateUserMutation,
    useGetDefaultAvatarQuery, useGetRandomPasswordQuery,
    useAddPasslistMutation, useGetPasslistQuery
} from "./stores/backendAPI";
import { UserContext } from './App.jsx'
import { Button, Container, Card, ButtonGroup, Modal, Form, Row, Col, Image, Spinner } from 'react-bootstrap'
import * as Icon from 'react-bootstrap-icons';
import PassTodo from './components/PassTodo'


function Profile() {
    const { Secret, user, setUser, cookies,setError } = useContext(UserContext);
    const [EditUser, setEditUser] = useState(false)
    const [PassListShow, setPassListShow] = useState(false)
    const [PassListElement, setPassListElement] = useState(null)
    const [KeyList, setKeyList] = useState([])
    const [Default, setDefault] = useState(false);
    const FirstName = useRef(null);
    const LastName = useRef(null);
    const Avatar = useRef(null);
    const Password = useRef(null);
    const Key = useRef(null);
    const [AvatarImage, setAvatarImage] = useState(false)
    const { data, error, isLoading, isError, isSuccess, refetch } = useGetUserQuery({ 'Secret': Secret, 'Cookies': cookies['user'] })
    const DA = useGetDefaultAvatarQuery()
    const [updateUser] = useUpdateUserMutation()
    const [addPasslist] = useAddPasslistMutation()
    const [Eye, setEye] = useState(<Icon.EyeSlashFill />)
    const [Dice, setDice] = useState({ "Number": 1, "Icon": <Icon.Dice1Fill /> })
    const RP = useGetRandomPasswordQuery();
    const PL = useGetPasslistQuery({ 'Secret': Secret, 'Cookies': cookies['user'] })

    function RandomPassword() {
        RP.refetch()
        if (RP.isSuccess) {
            const input = document.getElementsByName('Password')[0]
            input.type === "password"
            input.value = RP.data.password;
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
        } else if (RP.isError) {
            setEditUser(false)
            setPassListShow(false)
            setError({ "error": "500", "message": error.message })
        }
    }



    function ShowPassword() {
        const input = document.getElementsByName('Password')[0]
        if (input.type === "password") {
            input.type = "text";
            setEye(<Icon.EyeFill />)
        } else {
            input.type = "password";
            setEye(<Icon.EyeSlashFill />)
        }
    }



    useEffect(() => {
        if (isError) {
            setEditUser(false)
            setPassListShow(false)
            setError({ "error": "500", "message": error.message });
        } else if (isSuccess) {
            if (data.message === "Get user success") {
                setUser(data.data);
            } else if (data.message === "No token found") {
                window.location="/login"
            } else {
                if (Object.keys(data.error).toString().includes("message")) {
                    setEditUser(false)
                    setPassListShow(false)
                    setError({ "error": "500", "message": "unknown error" })
                } else {
                    setEditUser(false)
                    setPassListShow(false)
                    setError({ "error": data.error, "message": data.message });
                }
            }
        }
    }, [data, isSuccess, isError, error, isLoading])

    useEffect(() => {
        if (PL.isError) {
            setEditUser(false)
            setPassListShow(false)
            setError({ "error": "500", "message": PL.error.message });
        } else if (PL.isSuccess) {
            if (PL.data.message === "Get passlist success") {
                const pl = PL.data.data.map((passlist) => {
                    setKeyList(Key => [...Key,passlist.Key])
                    return <PassTodo key={"Passlist-"+ passlist.ID} Refetch={PL.refetch}  passlist={passlist}/>
                })
                setPassListElement(pl)
            } else if (PL.data.message === "No passlist found") {
                setKeyList([null])
                setPassListElement(null)
            } else {
                if (Object.keys(PL.data.error).toString().includes("message")) {
                    setEditUser(false)
                    setPassListShow(false)
                    setError({ "error": "500", "message": "unknown error" })
                } else {
                    setEditUser(false)
                    setPassListShow(false)
                    setError({ "error": PL.data.error, "message": PL.data.message });
                }
            }
        }
    }, [PL.data, PL.isSuccess, PL.isError, PL.error, PL.isLoading])

    const edit = () => {
        setAvatarImage(<Image src={user.Avatar}></Image>)
        setEditUser(true)
        setPassListShow(false)
    }

    const showpasslist = () => {
        setEditUser(false)
        setPassListShow(true)
    }

    function CkeckText(event) {
        if (event.target.value.includes(" ") || event.target.value.includes(":") || event.target.value.includes(";") || event.target.value.includes(",")) {
            event.target.setCustomValidity("Can't use space or : or ; or , in your from");
        } else {
            event.target.setCustomValidity("");
        }
    }

    function deleteAvatar() {
        const input = document.getElementsByName("Avatar")[0]
        input.value = null
        setAvatarImage(<Image src={DA.data.data}></Image>)
        setDefault(true)
    }

    function changeImage(event) {
        var url = URL.createObjectURL(event.target.files[0]);
        setDefault(false)
        setAvatarImage(<Image src={url}></Image>)
    }

    
    function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    }

    async function SubmitAddPasslist(event) {
        event.preventDefault();
        const input = document.getElementsByName("Key")[0];
        if (Password.current.value && Key.current.value) {
            input.setCustomValidity("");
            console.log(KeyList)
            if (!KeyList.includes(Key.current.value)) {
                addPasslist({ 'Key': Key.current.value, 'Password': Password.current.value, 'Secret': Secret, 'Cookies': cookies['user'] }).then((response) => {
                    if (response.data.message === "Add Passlist succeed") {
                        PL.refetch()
                    } else {
                        if (Object.keys(response.data.error).toString().includes("message")) {
                            console.error(response.data.error)
                            setEditUser(false)
                            setPassListShow(false)
                            setError({ "error": "500", "message": "unknown error" })
                        } else {
                            if (Object.keys(response.data.error).length === 0) {
                                setEditUser(false)
                                setPassListShow(false)
                                setError({ "error": "500", "message": response.data.message });
                            } else {
                                setEditUser(false)
                                setPassListShow(false)
                                setError({ "error": response.data.error, "message": response.data.message });
                            }
                        }
                    }
                }).catch((error) => {
                    console.error(error)
                    setEditUser(false)
                    setPassListShow(false)
                    setError({ "error": "500", "message": error.message });
                })
            } else {
                input.setCustomValidity("This Key already exists");
            }
        } else {
            input.setCustomValidity("Please input all");
        }
    }

    async function FormSubmitUser(event) {
        event.preventDefault();
        var avatar = null
        if (Default) {
            console.log(avatar)
            avatar = DA.data.data
        } else {
            if (Avatar.current.files.length>0) {
                avatar = await getBase64(Avatar.current.files[0])
            } else {
                avatar = user.Avatar
            }
        }
        const input = document.getElementsByName("FirstName")[0];
        if (FirstName.current.value && LastName.current.value && avatar) {
            input.setCustomValidity("Please input all");
            updateUser({ 'FirstName': FirstName.current.value, 'LastName': LastName.current.value, 'Avatar': avatar, 'Secret': Secret, 'Cookies': cookies['user'] }).then((response) => {
                if (response.data.message === "Update user success") {
                    refetch()
                    setEditUser(false)
                } else {
                    if (Object.keys(response.data.error).toString().includes("message")) {
                        console.error(response.data.error)
                        setEditUser(false)
                        setPassListShow(false)
                        setError({ "error": "500", "message": "unknown error" })
                    } else {
                        if (Object.keys(response.data.error).length === 0) {
                            setEditUser(false)
                            setPassListShow(false)
                            setError({ "error": "500", "message": response.data.message });
                        } else {
                            setEditUser(false)
                            setPassListShow(false)
                            setError({ "error": response.data.error, "message": response.data.message });
                        }
                    }
                }
            }).catch((error) => {
                console.error(error)
                setEditUser(false)
                setPassListShow(false)
                setError({ "error": "500", "message": error.message });
            })
        } else {
            input.setCustomValidity("Please input all");
        }
    }


    if (user) {
        return (
            <div>
                <Container>
                    <Card style={{ width: '20rem', color: 'black' }}>
                        <Card.Header >
                            <Card.Img variant="top" src={user.Avatar} />
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {user.FirstName} {user.LastName}
                            </Card.Text>
                            <ButtonGroup className="mb-3" >
                                <Button variant="primary" onClick={edit}>Edit Profile</Button>
                                <Button variant="primary" onClick={showpasslist} >Password List</Button>
                            </ButtonGroup>
                        </Card.Body>
                    </Card>
                </Container>

                <Modal show={EditUser} onHide={() => setEditUser(false)} size="lg"
                    aria-labelledby="Edit-User"
                    centered
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Profile</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className="form-horizontal form" onSubmit={FormSubmitUser}>
                            <Row className="mb-3">
                                <Form.Group as={Col} className="mb-3" controlId="formFirstName">
                                    <Form.Label className="label">First Name</Form.Label>
                                    <Form.Control type="text" placeholder="First Name" name="FirstName" ref={FirstName} maxLength="100" required onChange={CkeckText} defaultValue={user.FirstName} />
                                </Form.Group>

                                <Form.Group as={Col} className="mb-3" controlId="formLastName">
                                    <Form.Label className="label">Last Name</Form.Label>
                                    <Form.Control type="text" placeholder="Last Name" name="LastName" ref={LastName} maxLength="100" required onChange={CkeckText} defaultValue={user.LastName} />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} className="mb-3" controlId="formAvatar">
                                    <Form.Label className="label">{AvatarImage}</Form.Label>
                                    <Form.Control type="file" accept="image/*" placeholder="Avatar" name="Avatar" ref={Avatar} onChange={changeImage} />
                                </Form.Group>
                                <ButtonGroup className="mb-3" >
                                    <Button onClick={deleteAvatar} variant="danger">Delete Avatar</Button>
                                </ButtonGroup>
                            </Row>
                            <Row>
                                <ButtonGroup className="mb-3" >
                                    <Button type="submit" variant="success">Submit</Button>
                                </ButtonGroup>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal show={PassListShow} fullscreen={true} onHide={() => setPassListShow(false)}
                    aria-labelledby="Pass-List"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Password List</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {PassListElement}
                        <hr/>
                        <div key="Passlist-Add">
                            <Form className="form-horizontal form" onSubmit={SubmitAddPasslist}>
                                <Row className="align-items-center">
                                    <Col xs="auto" className="my-1">
                                        <Form.Label className="label" >Key:</Form.Label>
                                    </Col>
                                    <Col xs="auto" className="my-1">
                                        <Form.Control type="text" placeholder="Key" name="Key" ref={Key} maxLength="100" required onChange={CkeckText} />
                                    </Col>
                                    <Col xs="auto" className="my-1">
                                        <Form.Label className="label">Password:</Form.Label>
                                    </Col>
                                    <Col xs="auto" className="my-1">
                                        <Form.Control type="password" placeholder="Password" name="Password" ref={Password} maxLength="100" required onChange={CkeckText} />
                                    </Col>
                                    <Col xs="auto" className="my-1">
                                        <ButtonGroup >
                                            <Button type="button" name="ShowPassword" onClick={ShowPassword} >{Eye}</Button>
                                            <Button type="button" name="RandomPassword" onClick={RandomPassword} >{Dice.Icon}</Button>
                                            <Button type="submit" variant="success">Submit</Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )
    } else if (isLoading) {
        return (
            <div>
                <Container>
                    <Spinner animation="border" role="status" variant="primary" style={{ width: "8rem", height: "8rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            </div>
        )
    } else {
        return (
            <div>
                <Container>
                    <h1>404</h1>
                </Container>
            </div>
        )
    }
}

export default Profile;
