import React, { useContext } from 'react'
import { Alert } from 'react-bootstrap'
import * as Icon from 'react-bootstrap-icons'
import { UserContext } from '../App.jsx'

function ShowError() {
    const {Error, setError} = useContext(UserContext);

    return (
        <div>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                <Alert.Heading><Icon.ExclamationDiamond /> {Error.error} <Icon.ExclamationDiamond /></Alert.Heading>
                <p>{Error.message}</p>
            </Alert>
        </div>
    )
}

export default ShowError