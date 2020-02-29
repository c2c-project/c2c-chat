import React from 'react';
import Board from 'react-trello';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from './Dialog';

const cards = [
    {
        id: 'Card1',
        title: 'Write Blog',
        description: 'Can AI make memes',
        label: '30 mins',
        draggable: true
    },
    {
        id: 'Card2',
        title: 'Pay Rent',
        description: 'Transfer via NEFT',
        label: '5 mins',
        draggable: true
    },
    {
        id: 'Card3',
        title: 'Pay Rent to Xichao',
        description: 'Transfer via AME',
        label: '5 mins',
        draggable: true
    },
    {
        id: 'Card4',
        title: 'Pay Rent to Xichao hahahahahahahahahahah',
        description: 'Transfer via AME hahahahahahahahhahahahahahahahaha',
        label: '5 mins',
        draggable: true
    }
];

const data = {
    lanes: [
        {
            id: 'lane1',
            title: 'Wait for Asking',
            label: '2/2',
            cards
        },
        {
            id: 'pastCard',
            title: 'Past Card',
            label: '2/2',
            cards: []
        }
    ]
};

export default function TrelloDashboard() {
    const [pastCard, setPastCards] = React.useState();

    const [cardState, setCards] = React.useState(cards);

    const [question, setQuestion] = React.useState('');
    const [id, setId] = React.useState(0);
    const [Current, setCurrent] = React.useState('Current Question');
    const [currentCard, setCurrentCard] = React.useState({});
    const [clickedQuestion, setClickedQuestion] = React.useState({});
    const [open, setOpen] = React.useState(false);

    function enterHit(e) {
        e.preventDefault();
        setQuestion('');

        // cardState.push({ id: id, title: question, draggable: true });

        setCards(prevState => [
            ...prevState,
            { id, title: question, draggable: true }
        ]);

        setId((id + 1).toString());
        console.log(cardState.length);
    }

    const handleClick = (cardId, laneId) => {
        if (laneId === 'lane1') {
            for (let i = 0; i < cardState.length; i++) {
                if (cardState[i].id === cardId) {
                    setClickedQuestion(cardState[i]);
                }
            }
            setOpen(true);
        }
    };

    const currentInit = () => {
        setCurrent('Waiting for the next question ...');
        setCurrentCard({});
    };

    const moveFinished = () => {
        currentInit();
        if (currentCard.title) {
            setPastCards([...pastCard, currentCard]);
            // pastCard.push(currentCard);
        }
    };

    const handleFinishedButtonHit = () => {
        moveFinished();
    };
    const handleSetCurrent = () => {
        if (currentCard.title) {
            moveFinished();
        } else {
            currentInit();
        }
        setCurrent(clickedQuestion.title);
        setCurrentCard(clickedQuestion);
        setCards(
            cardState.filter(function(ele) {
                return ele != clickedQuestion;
            })
        );
        handleClose();
    };

    function handleClose() {
        setOpen(false);
    }
    return (
        <div>
            <div>
                <h1>{Current}</h1>
                <Button onClick={handleFinishedButtonHit}>
                    Move to Finish
                </Button>
            </div>
            <div>
                <form onSubmit={enterHit}>
                    <TextField
                        required
                        id='filled-required'
                        label='Required'
                        defaultValue='Hello World'
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        variant='outlined'
                    />
                </form>
            </div>
            <div>
                <Board
                    data={data}
                    draggable
                    laneDraggable={false}
                    onCardClick={(cardId, matadata, laneId) =>
                        handleClick(cardId, laneId)
                    }
                />
            </div>
            <Dialog
                handleSetCurrent={handleSetCurrent}
                handleClose={handleClose}
                data={clickedQuestion}
                open={open}
            />
        </div>
    );
}
