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
  const onSubmit = e => {
   e.preventDefault();
   fetch(`/api/sessions/${type}`, {
       method: 'GET',
       body:
           type === 'create'
               ? JSON.stringify({ form: state })
               : JSON.stringify({ form: state, sessionId: editTarget }),
       headers: {
           'Content-Type': 'application/json'
       }
   }).then(() => {
       // TODO: handle errors later
       cb();
   });
};
      return(
         <div>{}</div>
      );
   
}


/*
router.get(
    '/find/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        Sessions.findSessionById(sessionId).then(r => {
            res.json(r);
        });
    }
);
    const onSubmit = e => {
        e.preventDefault();
        fetch(`/api/sessions/${type}`, {
            method: 'POST',
            body:
                type === 'create'
                    ? JSON.stringify({ form: state })
                    : JSON.stringify({ form: state, sessionId: editTarget }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            // TODO: handle errors later
            cb();
        });
    };
    this is sent from sessions.js from route
    router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { form } = req.body;
        // TODO: add role checking
        Sessions.addSession(form)
            .then(() => res.send({ success: true }))
            .catch(err => {
                console.log(err);
                res.send({ success: false });
            });
    }
);

    as you can see the type POST is sent to router.post and ${type} is create if
    passed as a prop and used to fill in that URL `/api/sessions/${type}`




*/