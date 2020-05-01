import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Grow from '@material-ui/core/Grow';
import useSnack from '../hooks/useSnack';

const useStyles = makeStyles(theme => ({
	root: {
		height: '100%'
	},
	paper: {
		// not necessary anymore?
		// marginTop: '64-px', // slight offset to make the component feel more vertically centered
		padding: theme.spacing(2)
	}
}));

export default function PasswordResetPage() {
	const classes = useStyles();
	const history = useHistory();
	const [form, setForm] = React.useState({
		email: ''
	});
	const {token} = useParams();
	const [snack] = useSnack();

	const handleChange = (e, id) => {
		e.preventDefault();
		const { value } = e.target;
		setForm(state => ({ ...state, [id]: value }));
		console.log(form);
	};

	const handleSubmit = e => {
		e.preventDefault();
		fetch('/api/users/request-password-reset', {
				method: 'POST',
				body: JSON.stringify({ form }),
				headers: {
					'Content-Type': 'application/json'
				}
		}).then(res => {
			if (res.status === 200) {
				history.push('/login');
				snack('Email Sent', 'success');
			} else {
				snack(`Error: ${res.statusText}`, 'error');
			}
			console.log(res);
		});
	};

	return (
		<Container maxWidth='md' className={classes.root}>
			<Grow timeout={300} in>
				<Grid
					container
					direction='column'
					className={classes.root}
					alignContent='center'
					justify='center'
				>
					<Paper className={classes.paper}>
						<form onSubmit={handleSubmit}>
							<Grid
								container
								spacing={2}
								className={classes.root}
								alignContent='center'
							>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										variant='outlined'
										type='email'
										value={form.password}
										onChange={e =>
											handleChange(e, 'email')
										}
										label='Email'
									/>
									</Grid>
									<Grid
										container
										item
										item
										xs={12}
										justify='space-between'
									>
										<Button
											onClick={e => {
												e.preventDefault();
												history.push('/login');
											}}
											variant='text'
										>
											Login
										</Button>
										<Button
											type='submit'
											variant='contained'
											color='primary'
										>
											Send Reset Email
										</Button>
									</Grid>
							</Grid>
						</form>
					</Paper>
				</Grid>
			</Grow>
		</Container>
	);
}
