import React from 'react';
import Grid from '@material-ui/core/Grid';
import Stats from '../components/Stats';

class SessionData extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
        sent: null,
        asked: null,
        unanswered: null,
        duration: null,
      };
    }
    
    state = {
       sent: this.props.location.state.sent,
       asked: this.props.location.state.asked,
       unanswered: this.props.location.state.unanswered,
       duration: this.props.location.state.duration
    }
    
   render() {
      return(
         <Grid 
         container
         justify-center>
            <Stats
            sent={this.props.location.state.sent}
            asked={this.props.location.state.asked}
            unanswered={this.props.location.state.unanswered}
            duration={this.props.location.state.duration}
            />
         </Grid>
      );
   }


}

export default SessionData;