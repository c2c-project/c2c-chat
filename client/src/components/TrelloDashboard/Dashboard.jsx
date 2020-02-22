import React from 'react'
import Board from 'react-trello'
import TextField from '@material-ui/core/TextField';

const data = {
    
    lanes: [
        {
            id: 'lane1',
            title: 'Wait for Asking',
            label: '2/2',
            cards: [
                {id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: true},
                {id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins', metadata: {sha: 'be312a1'}},
                {id: 'Card3', title: 'Pay Rent to Xichao', description: 'Transfer via AME', label: '5 mins', metadata: {sha: 'be312a1'}}
            ],
        },
        {
            id: 'lane3',
            title: 'Answered Question',
            label: '0/0',
            cards: []
        }
    ]
}
export default function TrelloDashboard() {
    return(
        <div>
            <div>
                <h1>Current question</h1>
            </div>
            <div>
                <TextField
                    required
                    id="filled-required"
                    label="Required"
                    defaultValue="Hello World"
                    onKeyPress
                    variant="outlined"
                />
            </div>
            <div>
                <Board data={data} draggable laneDraggable={false} />
            </div>
        </div>
    )
}