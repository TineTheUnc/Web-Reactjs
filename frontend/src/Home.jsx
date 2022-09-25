import React, { useState, useContext } from 'react';
import { UserContext } from './App.jsx'
import { Button, Container } from 'react-bootstrap'
import { useGetRandomPasswordQuery } from './stores/backendAPI.jsx';


function Home() {
    const { setError } = useContext(UserContext);
    const { data, isError, isSuccess, refetch } = useGetRandomPasswordQuery();
    const [password, setPassword] = useState("");

    function getRandomPassword() {
        refetch()
        if (isError) {
            setError({ "error": "500", "message": "Can't get random password" })
        }
        else if (isSuccess) {
            setPassword(data.password);
        }
    }

    function copytext() {
        navigator.clipboard.writeText(password);
    }

    return (
        <div>
            <div>
                <Container>
                    <Button onClick={getRandomPassword}>
                        Generate Password
                    </Button><br /><br />
                    <Button onClick={copytext} variant="outline-light"><h1>{password}</h1></Button>
                </Container>
            </div>
        </div>
    )
}

export default Home;