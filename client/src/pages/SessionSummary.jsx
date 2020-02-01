// TODO: joseph 
/**
 * Use the components you made here and do the fetching here
 *  or at the component level depending on your design choice
 * Examples of fetch can be found by google
 *  public fetches with no auth src/pages/sessions.jsx
 * fetches with auth in src/components/chat/MessageActions.jsx
 * 
 */

import React from 'react';
import { useHistory } from 'react-router-dom';




export default function SessionSummary() {
   const [data, setData] = React.useState([]);
   const history = useHistory();
   React.useEffect(() => {
      fetch('/api/sessions/find').then(res => {
         console.log.out("test");
          res.json().then(r => setData(r));
      });
  });
      return(
         <div>{}</div>
      );
   
}
