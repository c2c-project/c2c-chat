import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%'
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0
        }
    },
    appBar: {
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth
        }
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none'
        }
    },
    // toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        height: '100%',
        [theme.breakpoints.down('xs')]: {
            paddingTop: '64px'
        }
    }
}));

const parseTitle = title =>
    title
        .split('-')
        .reduce((accum, word) => `${accum} ${word.toUpperCase()}`, '');

const config = [
    { label: 'Sessions', to: '/app/sessions' },
    // { label: 'Calendar', to: '/calendar' },
    { label: 'Chat', to: '/app/chat/0' },
    { label: 'Logout', to: '/logout' }
];

function ResponsiveDrawer({ children }) {
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const { title } = useParams();
    // TODO: add effects for if it is selected
    // eslint-disable-next-line
    const [selected, setSelected] = React.useState('');

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>
                {config.map(({ label, to }) => (
                    <ListItem
                        component={Link}
                        to={to}
                        button
                        onClick={() => setSelected(label)}
                        key={label}
                    >
                        <ListItemText primary={label} />
                    </ListItem>
                ))}
            </List>
            <Divider />
        </div>
    );

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Hidden smUp>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color='inherit'
                            aria-label='open drawer'
                            edge='start'
                            onClick={handleDrawerToggle}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant='h6' noWrap>
                            {parseTitle(title)}
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Hidden>
            <nav className={classes.drawer} aria-label='mailbox folders'>
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden smUp implementation='css'>
                    <Drawer
                        variant='temporary'
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper
                        }}
                        ModalProps={{
                            keepMounted: true // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation='css'>
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper
                        }}
                        variant='permanent'
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <main className={classes.content}>
                {/* <Hidden smUp>
                    <div className={classes.toolbar} />
                </Hidden> */}
                {children}
            </main>
        </div>
    );
}

ResponsiveDrawer.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired
};

export default ResponsiveDrawer;
