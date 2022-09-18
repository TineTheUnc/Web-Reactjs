import React, { useState } from 'react';
import axios from 'axios';
import { Button, Alert, Container  } from 'react-bootstrap'
import * as Icon from 'react-bootstrap-icons';
import { useGetRandomPasswordQuery} from './stores/backendAPI.jsx';


function Home() {
    const { data, error, isLoading, isError, isSuccess, refetch } = useGetRandomPasswordQuery();
    const [password, setPassword] = useState("");
    const [Error, setError] = useState(null);

    function getRandomPassword() {
        refetch()
        if (isError){
            setError({"error":"500","message":"Can't get random password"})
        }
        else if (isSuccess){
            setPassword(data.password);
        }
    }

    function copytext() {
        navigator.clipboard.writeText(password);
    }

    if (Error) {
        return (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                <Alert.Heading><Icon.ExclamationDiamond /> {Error.error} <Icon.ExclamationDiamond /></Alert.Heading>
                <p>{Error.message}</p>
            </Alert>
        )
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