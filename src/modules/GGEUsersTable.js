import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Backdrop from '@mui/material/Backdrop'
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'

import { ErrorType, ActionType, LogLevel } from "../types.js"
import UserSettings from './userSettings'
import settings from '../settings.json'
import { Grid, useMediaQuery, useTheme, IconButton } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

/* ── Log Viewer ── */
function Log({ ws, __ }) {
    const [currentLogs, setCurrentLogs] = React.useState([])

    React.useEffect(() => {
        const logGrabber = msg => {
            let [err, action, obj] = JSON.parse(msg.data.toString())

            if (Number(action) !== ActionType.GetLogs)
                return

            if (Number(err) !== ErrorType.Success)
                return

            setCurrentLogs(obj[0].splice(obj[1], obj[0].length - 1).concat(obj[0]).map((obj, index) => {
                const levelColor =
                    obj[0] === LogLevel.Error ? '#f04a4a' :
                    obj[0] === LogLevel.Warn  ? '#f5a623' : '#5d6af7'

                const levelLabel =
                    obj[0] === LogLevel.Error ? 'ERR' :
                    obj[0] === LogLevel.Warn  ? 'WRN' : 'INF'

                let items = obj[1].map(__).join("")
                return (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '5px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '12px',
                        lineHeight: '1.5',
                    }}>
                        <span style={{
                            color: levelColor,
                            fontWeight: 700,
                            minWidth: '30px',
                            fontSize: '10px',
                            marginTop: '2px',
                            letterSpacing: '0.06em',
                            opacity: 0.9,
                        }}>{levelLabel}</span>
                        <span style={{ color: 'rgba(255,255,255,0.75)', wordBreak: 'break-word' }}>{items}</span>
                    </div>
                )
            }).reverse())
        }
        ws.addEventListener("message", logGrabber)
        return () => ws.removeEventListener("message", logGrabber)

    }, [ws, __])

    return (
        <Paper sx={{
            overflow: 'auto',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            backgroundColor: '#0d0e14',
        }}>
            <Box sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}>
                <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#3ecf8e', display: 'inline-block',
                    boxShadow: '0 0 8px rgba(62,207,142,0.6)',
                }} />
                <Typography variant="caption" sx={{
                    color: '#8b8fa8', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.7rem'
                }}>
                    Live Logs
                </Typography>
            </Box>
            <div onClick={e => e.stopPropagation()} style={{ maxHeight: "75vh", maxWidth: "80vw", minWidth: "500px", padding: '12px 16px', overflowY: 'auto' }}>
                {currentLogs.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#484c66', textAlign: 'center', py: 4, fontStyle: 'italic' }}>
                        No logs yet…
                    </Typography>
                ) : currentLogs}
            </div>
        </Paper>
    )
}

/* ── Language Selector ── */
function Language({ languageCode, setLanguage }) {
    const [anchorEl, setAnchorEl] = React.useState(null)
    const open = Boolean(anchorEl)
    const handleClick = event => { setAnchorEl(event.currentTarget) }
    const handleClose = () => { setAnchorEl(null) }

    const languages = [
        { code: 'en', label: '🇬🇧 EN' },
        { code: 'pl', label: '🇵🇱 PL' },
        { code: 'de', label: '🇩🇪 DE' },
        { code: 'tr', label: '🇹🇷 TR' },
        { code: 'ar', label: '🇸🇦 AR' },
        { code: 'cs', label: '🇨🇿 CS' },
    ]

    return (
        <>
            <Button
                id="lang-button"
                aria-controls={open ? 'lang-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                size="small"
                sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#8b8fa8',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '7px',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto',
                    '&:hover': {
                        color: '#f0f0f5',
                        borderColor: 'rgba(93,106,247,0.5)',
                        backgroundColor: 'rgba(93,106,247,0.08)',
                    },
                }}
            >
                {languageCode?.toUpperCase() ?? 'EN'}
            </Button>
            <Menu
                id="lang-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'lang-button',
                    },
                }}
            >
                {languages.map(({ code, label }) => (
                    <MenuItem
                        key={code}
                        onClick={() => { setLanguage(code); handleClose() }}
                        selected={languageCode === code}
                        sx={{ fontSize: '0.82rem', gap: 1 }}
                    >
                        {label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}

/* ── Resources Panel ── */
const assets =
    JSON.parse(await (await fetch(`//${window.location.hostname}:${settings.port ?? window.location.port}/assets.json`)).text())

function Resources({ __, openResources: resources, languageCode }) {
    if(!resources)
        return <></>
    
    delete resources["coins"]
    delete resources["rubies"]

    const nameOverrides = {
        screws: "component1",
        blackPowder: "component2",
        saws: "component3",
        drills: "component4",
        crowbars: "component5",
        leatherStrips: "component6",
        chains: "component7",
        metalPlates: "component8",
    }
    for (const key in nameOverrides) {
        const value = resources[key]
        if(value) {
            resources[nameOverrides[key]] = value
            delete resources[key]
        }
    }
    for (const key in resources) {
        if([undefined, 0, null].includes(resources[key])) {
            delete resources[key]
            continue
        }
        if (Number(resources[key])) {
            const skipOverrides = {
                "1MinSkip": 1,
                "5MinSkip": 5,
                "10MinSkip": 10,
                "30MinSkip": 30,
                "60MinSkip": 60,
                "5HourSkip": 5,
                "24HourSkip": 24,
            }
            const value = skipOverrides[key]
            resources[key] = `${value? `${value}x` : ""}${new Intl.NumberFormat(languageCode, { notation: 'compact' }).format(resources[key])}`
        }
    }
    function capitalizeFirstLetter(val) {
        return String(val).charAt(0).toLocaleUpperCase() + String(val).slice(1);
    }

    return (
        <Paper sx={{
            overflow: 'auto',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#13141c',
        }}>
            <Box sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}>
                <Typography variant="caption" sx={{
                    color: '#8b8fa8', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.7rem'
                }}>
                    Resources
                </Typography>
            </Box>
            <div onClick={e => e.stopPropagation()} style={{ maxHeight: "78vh", maxWidth: "80vw" }}>
                <Grid container spacing={2} padding={"20px"}>
                    {
                        Object.entries(resources).map(([key, value], i) => {
                            const jsonKey = capitalizeFirstLetter(key)
                            return <Grid item xs={4} sm={3} md={2} key={i}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    padding: '12px 8px',
                                    height: '100%',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(93,106,247,0.08)',
                                        borderColor: 'rgba(93,106,247,0.4)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}>
                                    <div style={{ height: "32px", width: "32px", marginBottom: '8px' }}>
                                        <img onError={(e) => {
                                            e.currentTarget.outerHTML = `<div style="height:32px;width:32px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#8b8fa8;text-align:center">${__(key)}</div>`
                                        }} style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                        src={`//${window.location.hostname}:${settings.port ?? window.location.port}/ggeProxyEmpire5/default/assets/${assets[`Collectable_Currency_${jsonKey}`]}.webp`}
                                        alt={__(key)}></img>
                                    </div>
                                    <Typography variant="caption" sx={{ color: '#8b8fa8', fontSize: '0.62rem', mb: 0.3, textAlign: 'center', lineHeight: 1.1 }}>
                                        {__(key)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#f0f0f5', fontWeight: 700, fontSize: '0.8rem' }}>
                                        {value}
                                    </Typography>
                                </Box>
                            </Grid>
                        })
                    }
                </Grid>
            </div>
        </Paper>
    );
}

/* ── Main Player Table & Cards ── */
function PlayerTable({ setLanguage, __, languageCode, rows, usersStatus, ws, channelInfo, handleSettingsOpen, handleLogOpen, setSelectedUser, setOpenSettings, handleResourcesOpen }) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [selected, setSelected] = React.useState([])
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [actionUser, setActionUser] = React.useState(null)

    const handleSelectAllClick = event => {
        if (event.target.checked) {
            const newSelected = rows.map(n => n.id)
            setSelected(newSelected)
            return
        }
        setSelected([])
    }

    const handleActionClick = (event, user) => {
        setAnchorEl(event.currentTarget)
        setActionUser(user)
    }

    const handleActionClose = () => {
        setAnchorEl(null)
        setActionUser(null)
    }

    const ActionButtons = ({ user, state, isMenu = false }) => {
        const hasError = usersStatus[user.id]?.hasError
        const status = usersStatus[user.id] ?? {}

        if (isMenu) {
            return (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && actionUser?.id === user.id}
                    onClose={handleActionClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={() => { handleResourcesOpen(status); handleActionClose() }}>
                        {__("resources")}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        ws.send(JSON.stringify([ErrorType.Success, ActionType.GetLogs, user]))
                        handleLogOpen()
                        handleActionClose()
                    }}>
                        {__("logs")}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setSelectedUser(user)
                        setOpenSettings(true)
                        handleActionClose()
                    }}>
                        {__("settings")}
                    </MenuItem>
                    <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.05)' }} />
                    <MenuItem
                        onClick={() => {
                            user.state = !state
                            ws.send(JSON.stringify([ErrorType.Success, ActionType.SetUser, user]))
                            handleActionClose()
                        }}
                        sx={{ color: state ? theme.palette.error.main : theme.palette.primary.main }}
                    >
                        {state ? __("stop") : __("start")}
                    </MenuItem>
                </Menu>
            )
        }

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                {!isMobile && (
                    <>
                        <Button variant="text" size="small" onClick={() => handleResourcesOpen(status)} sx={{ fontSize: '0.75rem', px: 1 }}>
                            {__("resources")}
                        </Button>
                        <Button variant="text" size="small" onClick={() => {
                            ws.send(JSON.stringify([ErrorType.Success, ActionType.GetLogs, user]))
                            handleLogOpen()
                        }} sx={{ fontSize: '0.75rem', px: 1 }}>
                            {__("logs")}
                        </Button>
                        <Button variant="text" size="small" onClick={() => {
                            setSelectedUser(user)
                            setOpenSettings(true)
                        }} sx={{ fontSize: '0.75rem', px: 1 }}>
                            {__("settings")}
                        </Button>
                    </>
                )}
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                        user.state = !state
                        ws.send(JSON.stringify([ErrorType.Success, ActionType.SetUser, user]))
                    }}
                    color={state ? "error" : "primary"}
                    sx={{
                        minWidth: '62px',
                        height: '28px',
                        fontSize: '0.72rem',
                        ml: 0.5,
                        ...(state ? {
                            background: 'linear-gradient(135deg, #f04a4a, #c0392b)',
                            boxShadow: '0 3px 10px rgba(240,74,74,0.3)',
                        } : {}),
                    }}
                >
                    {state ? __("stop") : __("start")}
                </Button>
                {isMobile && (
                    <IconButton size="small" onClick={(e) => handleActionClick(e, user)} sx={{ ml: 0.5, color: '#8b8fa8' }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        )
    }

    const PlayerRow = ({ row, index }) => {
        let getEnabledPlugins = () => {
            let enabledPlugins = []
            Object.entries(row.plugins).forEach(([key, value]) => {
                if (Boolean(value.state) === true && Boolean(value.forced) !== true)
                    enabledPlugins.push(key)
            })
            return enabledPlugins
        }

        const isItemSelected = selected.includes(row.id)
        const [state] = React.useState(row.state)
        row.state = state

        let status = usersStatus[row.id] ?? {}
        const hasError = status?.hasError

        if (isMobile) {
            return (
                <Paper className="glass-card" sx={{ p: 2, mb: 2, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Checkbox
                                size="small"
                                color="primary"
                                checked={isItemSelected}
                                onClick={() => {
                                    let idx = selected.indexOf(row.id)
                                    if (idx < 0) {
                                        setSelected([...selected, row.id])
                                    } else {
                                        setSelected(selected.filter(id => id !== row.id))
                                    }
                                }}
                                sx={{ p: 0 }}
                            />
                            <Avatar sx={{
                                width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700,
                                background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                            }}>
                                {row.name?.[0]?.toUpperCase() ?? '?'}
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#f0f0f5' }}>
                                    {row.name}
                                </Typography>
                                {hasError && <Typography variant="caption" sx={{ color: '#f04a4a', fontWeight: 600 }}>Error detected</Typography>}
                            </Box>
                        </Box>
                        <ActionButtons user={row} state={state} />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                        {getEnabledPlugins().map((plug, i) => (
                            <Chip key={i} label={__(plug.charAt(0).toUpperCase() + plug.slice(1)) || __(plug)} size="small" sx={{
                                height: 18, fontSize: '0.62rem', backgroundColor: 'rgba(93,106,247,0.1)', color: '#7b87f9', border: '1px solid rgba(93,106,247,0.2)'
                            }} />
                        ))}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 1 }}>
                        {Object.entries(status).map(([key, value], idx) => {
                            if (['id', 'hasError', 'resources'].includes(key) || !value || value <= 0) return null
                            return (
                                <Box key={idx} sx={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', py: 0.5, px: 0.5
                                }}>
                                    <Typography sx={{ color: '#8b8fa8', fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>{__(key.charAt(0).toUpperCase() + key.slice(1)) || __(key)}</Typography>
                                    <Typography sx={{ color: '#f0f0f5', fontSize: '0.75rem', fontWeight: 700 }}>{value}</Typography>
                                </Box>
                            )
                        })}
                    </Box>
                    <ActionButtons user={row} state={state} isMenu={true} />
                </Paper>
            )
        }

        return (
            <TableRow
                sx={{
                    borderLeft: hasError ? `3px solid ${theme.palette.error.main}` : 'none',
                    backgroundColor: hasError ? 'rgba(240,74,74,0.02)' : 'transparent',
                }}
            >
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={() => {
                            let idx = selected.indexOf(row.id)
                            if (idx < 0) {
                                setSelected([...selected, row.id])
                            } else {
                                setSelected(selected.filter(id => id !== row.id))
                            }
                        }}
                    />
                </TableCell>

                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                            width: 30, height: 30, fontSize: '0.75rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                            boxShadow: '0 2px 8px rgba(93,106,247,0.3)',
                        }}>
                            {row.name?.[0]?.toUpperCase() ?? '?'}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#f0f0f5' }}>
                                {row.name}
                            </Typography>
                            {hasError && (
                                <Chip label="Error" size="small" sx={{
                                    height: 16, fontSize: '0.6rem', backgroundColor: 'rgba(240,74,74,0.15)', color: '#f04a4a'
                                }} />
                            )}
                        </Box>
                    </Box>
                </TableCell>

                <TableCell padding='none' sx={{ maxWidth: "20vw" }}>
                    <Box sx={{
                        display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'auto',
                        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: 0.5,
                    }}>
                        {getEnabledPlugins().map((plug, i) => (
                            <Chip key={i} label={__(plug.charAt(0).toUpperCase() + plug.slice(1)) || __(plug)} size="small" sx={{
                                height: 20, fontSize: '0.65rem', backgroundColor: 'rgba(93,106,247,0.08)', color: '#7b87f9'
                            }} />
                        ))}
                    </Box>
                </TableCell>

                <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                        {Object.entries(status).map(([key, value], idx) => {
                            if (['id', 'hasError', 'resources'].includes(key) || !value || value <= 0) return null
                            return (
                                <Box key={idx} sx={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '6px', px: 1, py: 0.4, minWidth: '40px'
                                }}>
                                    <Typography sx={{ color: '#8b8fa8', fontSize: '0.58rem', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>{__(key.charAt(0).toUpperCase() + key.slice(1)) || __(key)}</Typography>
                                    <Typography sx={{ color: '#f0f0f5', fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
                                </Box>
                            )
                        })}
                    </Box>
                </TableCell>

                <TableCell align="right" padding='none' sx={{ pr: 1.5 }}>
                    <ActionButtons user={row} state={state} />
                    <ActionButtons user={row} state={state} isMenu={true} />
                </TableCell>
            </TableRow>
        )
    }

    return (
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Paper className="glass-panel" sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                animation: 'fadeIn 0.5s ease-out',
            }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: { xs: 2, sm: 3 }, py: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    flexWrap: 'wrap', gap: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(93,106,247,0.4)',
                        }}>
                            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>G</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#f0f0f5', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                GGE Bot
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#8b8fa8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Command Center
                            </Typography>
                        </Box>
                        <Chip
                            label={`${rows.length} Active`}
                            size="small"
                            sx={{
                                height: 20, fontSize: '0.65rem', fontWeight: 700,
                                backgroundColor: 'rgba(62,207,142,0.1)', color: '#3ecf8e', border: '1px solid rgba(62,207,142,0.2)'
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Language setLanguage={setLanguage} languageCode={languageCode} />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(`https://discord.com/oauth2/authorize?client_id=${channelInfo[0]}&permissions=8&response_type=code&redirect_uri=${window.location.protocol === 'https:' ? "https" : "http"}%3A%2F%2F${window.location.hostname}%3A${(settings.port ?? window.location.port) !== '' ? (settings.port ?? window.location.port) : window.location.protocol === 'https:' ? "443" : "80"}%2FdiscordAuth&integration_type=0&scope=identify+guilds.join+bot`, "_blank")}
                            sx={{
                                px: 2, borderColor: 'rgba(255,255,255,0.1)', color: '#8b8fa8',
                                '&:hover': { borderColor: '#5865f2', color: '#fff', backgroundColor: 'rgba(88,101,242,0.15)' },
                            }}
                        >
                            Discord
                        </Button>
                        <Tooltip title={__("addPlayer") || "Add player"} arrow>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSettingsOpen}
                                sx={{
                                    minWidth: '36px', width: '36px', height: '36px', p: 0,
                                    fontSize: '1.4rem', fontWeight: 400, borderRadius: '10px',
                                }}
                            >+</Button>
                        </Tooltip>
                    </Box>
                </Box>

                {!isMobile ? (
                    <TableContainer>
                        <Table aria-label="players table">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ width: 50 }}>
                                        <Checkbox
                                            color="primary"
                                            checked={rows.length > 0 && rows.length === selected.length}
                                            indeterminate={selected.length > 0 && selected.length < rows.length}
                                            onClick={handleSelectAllClick}
                                        />
                                    </TableCell>
                                    <TableCell align="left">{__("name")}</TableCell>
                                    <TableCell align="left" padding='none'>{__("plugins")}</TableCell>
                                    <TableCell>{__("status")}</TableCell>
                                    <TableCell align='right' padding='none' sx={{ pr: 3 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 10 }}>
                                            <Typography variant="body1" sx={{ color: '#484c66', fontStyle: 'italic', opacity: 0.7 }}>
                                                No bots active. Click <span style={{ color: '#5d6af7', fontWeight: 700 }}>+</span> to add your first account.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row, index) => <PlayerRow key={row.id} row={row} index={index} />)
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ p: 2 }}>
                        {rows.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', py: 4, color: '#484c66' }}>No bots active.</Typography>
                        ) : (
                            rows.map((row, index) => <PlayerRow key={row.id} row={row} index={index} />)
                        )}
                    </Box>
                )}

                {selected.length > 0 && (
                    <Box sx={{
                        px: 3, py: 1.5, background: 'rgba(240,74,74,0.05)', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(240,74,74,0.1)'
                    }}>
                        <Typography sx={{ color: '#f04a4a', fontSize: '0.8rem', fontWeight: 600 }}>
                            {selected.length} account{selected.length > 1 ? 's' : ''} selected
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            sx={{ height: 30, px: 2, fontSize: '0.75rem' }}
                            onClick={() => ws.send(JSON.stringify([ErrorType.Success, ActionType.RemoveUser, rows.filter((e) => selected.includes(e.id))]))}
                        >
                            {__("remove")}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    )
}

/* ── Root Export ── */
export default function GGEUserTable({ setLanguage, __, languageCode, rows, usersStatus, ws, channelInfo, plugins }) {
    const user = {}

    const [openSettings, setOpenSettings] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState(user)
    const [openLogs, setOpenLogs] = React.useState(false)
    const [openResources, setOpenResources] = React.useState(false)

    const handleSettingsOpen = () => setOpenSettings(true)
    const handleSettingsClose = () => {
        setOpenSettings(false)
        setSelectedUser(user)
    }
    const handleLogClose = () => setOpenLogs(false)
    const handleLogOpen = () => setOpenLogs(true)
    const handleResourcesClose = () => setOpenResources(false)
    const handleResourcesOpen = (status) => setOpenResources(status.resources)

    return (
        <>
            {/* Settings Backdrop */}
            <Backdrop
                sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={openSettings}
                onClick={handleSettingsClose}
                style={{ maxHeight: '100%', overflow: 'auto' }}
                key={selectedUser.id}
            >
                <UserSettings
                    ws={ws}
                    selectedUser={selectedUser}
                    key={selectedUser.id}
                    closeBackdrop={handleSettingsClose}
                    plugins={plugins}
                    channels={channelInfo[1]}
                    __={__}
                />
            </Backdrop>

            {/* Logs Backdrop */}
            <Backdrop
                sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={openLogs}
                onClick={() => {
                    ws.send(JSON.stringify([ErrorType.Success, ActionType.GetLogs, undefined]))
                    handleLogClose()
                }}
                style={{ maxHeight: '100%', overflow: 'auto' }}
            >
                <Log ws={ws} __={__} />
            </Backdrop>

            {/* Resources Backdrop */}
            <Backdrop
                sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={openResources !== false}
                onClick={() => handleResourcesClose()}
                style={{ maxHeight: '100%', overflow: 'auto' }}
            >
                <Resources usersStatus={usersStatus} __={__} openResources={openResources} languageCode={languageCode} />
            </Backdrop>

            <PlayerTable
                setLanguage={setLanguage}
                __={__}
                languageCode={languageCode}
                rows={rows}
                usersStatus={usersStatus}
                ws={ws}
                channelInfo={channelInfo}
                handleSettingsOpen={handleSettingsOpen}
                handleLogOpen={handleLogOpen}
                handleResourcesOpen={handleResourcesOpen}
                setSelectedUser={setSelectedUser}
                setOpenSettings={setOpenSettings}
                plugins={plugins}
            />
        </>
    )
}