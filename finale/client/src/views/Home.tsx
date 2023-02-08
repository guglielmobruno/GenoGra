import React, {FC, useEffect, useState, Dispatch, SetStateAction} from "react";
import {Link} from "react-router-dom";
import FileUploader from "./FileUploader";
import Badge from 'react-bootstrap/Badge'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button'


const Home: FC <{name: string, setName: Dispatch<SetStateAction<string>>}> = ({name, setName}) => {

    const [available, setAvailable] = useState(['sars_cov2','sars_cov3']);


    return (
        <>
        <style type="text/css">
            {`.mb-3 {
                background-color: #333333;
                color: white;
            }
            .tab-content {
                color:white
            }
            .mb-2 {
                background-color: #333333;
            }`}
        </style>

        <div className='home'>

            {/* <Tabs  defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="home" title="Home"></Tab>
                <Tab eventKey="about" title="About" className="tb" disabled></Tab>
                <Tab eventKey="contact" title="Contact" className="tb"></Tab>
            </Tabs> */}
            {/* <Card bg={'dark'}
                    key={'Dark'}
                    text={'white'}
                    className="mb-2">
                <Card.Body>
                <Card.Title>Your Graphs</Card.Title>
                <Card.Text>
                    This is a longer card with supporting text below as a natural
                </Card.Text>
                <Card bg={'dark'}
                    key={'Dark'}
                    text='white'
                    border = 'light'
                    style={{ width: '18rem' }}
                    className="mb-2">
                    <Card.Header>Assembly</Card.Header>
                    <Card.Body>
                        <Card.Title>Graph1</Card.Title>
                        <Button variant="primary">Visualize</Button>
                    </Card.Body>
                </Card>
                <Card bg={'dark'}
                    key={'Dark'}
                    text='white'
                    border = 'light'
                    style={{ width: '18rem' }}
                    className="mb-2">
                    <Card.Body>
                        <Card.Title>Graph2</Card.Title>
                        <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                </Card> */}
                {/* <Card bg={'dark'}
                    key={'Dark'}
                    text='white'
                    border = 'light'
                    style={{ width: '18rem' }}
                    className="mb-2">
                    <Card.Body>
                        <Card.Title>Graph3</Card.Title>
                        <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                </Card>
                </Card.Body>
            </Card> */}
            {/* <div className='construct'>
                <h2>Graph Construction</h2> */}
                
                <FileUploader name={name} setName={setName}/>
            {/* </div> */}
            {/* <div className='construct'>
                <h2>Available Graphs</h2>
                <Link to="/graph" >Sars-COV2</Link>
                <ul>{available.map((gr) =>
                    <div>
                        <Link to={'/graph/'+gr}>{gr}</Link>
                        <br />
                    </div>
                )}</ul>
            </div> */}
        </div>
        </>
    )
}
export default Home;