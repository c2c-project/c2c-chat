import React from 'react'
import Board from 'react-trello'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import Dialog from './Dialog'
export default function TrelloDashboard() {
    const [cards, setCards] = React.useState([
        {id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: true},
        {id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins', draggable: true},
        {id: 'Card3', title: 'Pay Rent to Xichao', description: 'Transfer via AME', label: '5 mins', draggable: true},
        {id: 'Card4', title: 'Pay Rent to Xichao hahahahahahahahahahah', description: 'Transfer via AME hahahahahahahahhahahahahahahahaha', label: '5 mins', draggable: true}
    ])

    const [pastCard, setPastCards] = React.useState([])
    const data = {
        lanes: [
            {
                id: 'lane1',
                title: 'Wait for Asking',
                label: '2/2',
                cards: cards
            },
            {
                id: 'pastCard',
                title: 'Past Card',
                label: '2/2',
                cards: pastCard,
            },
        ]
    }

    const [question, setQuestion] = React.useState('')
    const [id, setId] = React.useState(0)
    const [Current, setCurrent] = React.useState('Current Question')
    const [currentCard, setCurrentCard] = React.useState({})
    const [clickedQuestion, setClickedQuestion] = React.useState({})
    function enterHit(e){
        e.preventDefault()
        setQuestion('')
        cards.push({id: id, title: question,draggable: true})
        setId((id+1).toString())
        console.log(cards.length)
    }

    const handleDataChange = (newData) =>{
        setCards(newData.lanes[0].cards)
        setPastCards(newData.lanes[1].cards)
    }

    const [open, setOpen] = React.useState(false)
    const handleClick = (cardId,laneId) =>{
        if(laneId === "lane1"){
            for(let i = 0; i < cards.length; i++){
                if(cards[i].id === cardId){
                    setClickedQuestion(cards[i])
                }
            }
            setOpen(true)
        }
    }

    const currentInit = () =>{
        setCurrent("Waiting for the next question ...")
        setCurrentCard({})
    }

    const moveFinished = ()=>{
        currentInit()
        if(currentCard.title){
            pastCard.push(currentCard)
        }
    }

    const handleFinishedButtonHit = () =>{
        moveFinished()
    }
    const handleSetCurrent = () =>{
        if(currentCard.title){
            moveFinished()
        }else{
            currentInit()
        }
        setCurrent(clickedQuestion.title)
        setCurrentCard(clickedQuestion)
        setCards(cards.filter(function(ele){
            return ele != clickedQuestion
        }))
        handleClose()
    }

    function handleClose(){
        setOpen(false)
    }
    return(
        <div>
            <div>
                <h1>{Current}</h1>
                <Button onClick={handleFinishedButtonHit}>Move to Finish</Button>
            </div>
            <div>
                <form onSubmit={enterHit}>
                    <TextField
                        required
                        id="filled-required"
                        label="Required"
                        defaultValue="Hello World"
                        value={question}
                        onChange={(e)=>setQuestion(e.target.value)}
                        variant="outlined"
                    />
                </form>
            </div>
            <div>
                <Board data={data} draggable
                    laneDraggable={false}
                    onDataChange={(newData) => handleDataChange(newData)}
                    onCardClick={(cardId, matadata, laneId) =>handleClick(cardId, laneId)}
                />
            </div>
            <Dialog handleSetCurrent={handleSetCurrent} handleClose={handleClose} data={clickedQuestion} open = {open}/>
        </div>
    )
}