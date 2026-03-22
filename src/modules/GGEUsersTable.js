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
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'

import { ErrorType, ActionType, LogLevel } from "../types.js"
import UserSettings from './userSettings'
import settings from '../settings.json'
import { Grid } from '@mui/material'

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
                            return <Grid key={i}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    minWidth: '70px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(93,106,247,0.06)',
                                        borderColor: 'rgba(93,106,247,0.3)',
                                    },
                                }}>
                                    <div style={{ height: "36px", width: "36px", marginBottom: '8px' }}>
                                        <img onError={(e) => {
                                            e.currentTarget.outerHTML = `<div style="height:36px;width:36px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#8b8fa8;text-align:center">${__(key)}</div>`
                                        }} style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                        src={`//${window.location.hostname}:${settings.port ?? window.location.port}/ggeProxyEmpire5/default/assets/${assets[`Collectable_Currency_${jsonKey}`]}.webp`}
                                        alt={__(key)}></img>
                                    </div>
                                    <Typography variant="caption" sx={{ color: '#8b8fa8', fontSize: '0.68rem', mb: 0.3 }}>
                                        {__(key)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#f0f0f5', fontWeight: 700, fontSize: '0.85rem' }}>
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

/* ── Main Player Table ── */
function PlayerTable({ setLanguage, __, languageCode, rows, usersStatus, ws, channelInfo, handleSettingsOpen, handleLogOpen, setSelectedUser, setOpenSettings, handleResourcesOpen }) {
    const [selected, setSelected] = React.useState([])
    const handleSelectAllClick = event => {
        if (event.target.checked) {
            const newSelected = rows.map(n => n.id)
            setSelected(newSelected)
            return
        }
        setSelected([])
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <TableContainer component={Paper} sx={{
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.07)',
                overflow: 'hidden',
            }}>
                {/* Header bar above table */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    flexWrap: 'wrap',
                    gap: 1,
                }}>
                    {/* Left: brand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 32, height: 32,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(93,106,247,0.4)',
                        }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem', lineHeight: 1 }}>G</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#f0f0f5', letterSpacing: '-0.01em' }}>
                            GGE Bot
                        </Typography>
                        <Chip
                            label={`${rows.length} players`}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                backgroundColor: 'rgba(93,106,247,0.15)',
                                color: '#7b87f9',
                                border: '1px solid rgba(93,106,247,0.25)',
                                '& .MuiChip-label': { px: 1 },
                            }}
                        />
                    </Box>

                    {/* Right: actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language setLanguage={setLanguage} languageCode={languageCode} />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={async () =>
                                window.open(`https://discord.com/oauth2/authorize?client_id=${channelInfo[0]}&permissions=8&response_type=code&redirect_uri=${window.location.protocol === 'https:' ? "https" : "http"}%3A%2F%2F${window.location.hostname}%3A${(settings.port ?? window.location.port) !== '' ? (settings.port ?? window.location.port) : window.location.protocol === 'https:' ? "443" : "80"}%2FdiscordAuth&integration_type=0&scope=identify+guilds.join+bot`, "_blank")}
                            sx={{
                                fontSize: '0.75rem',
                                borderColor: 'rgba(255,255,255,0.12)',
                                color: '#8b8fa8',
                                borderRadius: '7px',
                                px: 1.5,
                                '&:hover': {
                                    borderColor: '#5865f2',
                                    color: '#f0f0f5',
                                    backgroundColor: 'rgba(88,101,242,0.1)',
                                },
                            }}
                        >
                            {__('"linkDiscord"')}
                        </Button>
                        <Tooltip title={__("addPlayer") || "Add player"} placement="bottom">
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSettingsOpen}
                                sx={{
                                    minWidth: '32px',
                                    width: '32px',
                                    height: '32px',
                                    p: 0,
                                    fontSize: '1.2rem',
                                    lineHeight: 1,
                                    borderRadius: '8px',
                                }}
                            >+</Button>
                        </Tooltip>
                    </Box>
                </Box>

                <Table sx={{ minWidth: 650 }} aria-label="players table">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={rows.length > 0 && rows.length === selected.length}
                                    indeterminate={selected.length > 0 && selected.length < rows.length}
                                    onClick={handleSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all entries',
                                    }}
                                />
                            </TableCell>
                            <TableCell align="left">{__("name")}</TableCell>
                            <TableCell align="left" padding='none'>{__("plugins")}</TableCell>
                            <TableCell>{__("status")}</TableCell>
                            <TableCell align='right' padding='none' sx={{ pr: 1.5 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#484c66' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#484c66' }}>
                                        No players yet. Click + to add one.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {rows.map((row, index) => {
                            function PlayerRow() {
                                let getEnabledPlugins = () => {
                                    let enabledPlugins = []
                                    Object.entries(row.plugins).forEach(([key, value]) => {
                                        if (Boolean(value.state) === true && Boolean(value.forced) !== true)
                                            enabledPlugins.push(key)
                                        return
                                    })
                                    return enabledPlugins
                                }

                                const isItemSelected = selected.includes(row.id)
                                const labelId = `enhanced-table-checkbox-${index}`
                                const [state, setState] = React.useState(row.state)
                                row.state = state

                                let status = usersStatus[row.id] ?? {}
                                const hasError = status?.hasError

                                return (
                                    <TableRow
                                        sx={{
                                            border: hasError ? '1px solid rgba(240,74,74,0.5)' : 'none',
                                            backgroundColor: hasError ? 'rgba(240,74,74,0.04)' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: hasError
                                                    ? 'rgba(240,74,74,0.07)'
                                                    : 'rgba(255,255,255,0.03)',
                                            },
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                onClick={() => {
                                                    let index = selected.indexOf(row.id)
                                                    if (index < 0) {
                                                        selected.push(row.id)
                                                        setSelected(Array.from(selected))
                                                        return
                                                    }
                                                    setSelected(selected.toSpliced(index, 1))
                                                }}
                                                inputProps={{
                                                    'aria-labelledby': labelId,
                                                }}
                                            />
                                        </TableCell>

                                        {/* Player name with avatar */}
                                        <TableCell component="th" scope="row">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 30,
                                                    height: 30,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                                                    boxShadow: '0 2px 8px rgba(93,106,247,0.3)',
                                                }}>
                                                    {row.name?.[0]?.toUpperCase() ?? '?'}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#f0f0f5' }}>
                                                    {row.name}
                                                </Typography>
                                                {hasError && (
                                                    <Chip
                                                        label="Error"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '0.65rem',
                                                            backgroundColor: 'rgba(240,74,74,0.15)',
                                                            color: '#f04a4a',
                                                            border: '1px solid rgba(240,74,74,0.3)',
                                                            '& .MuiChip-label': { px: 0.8 },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* Plugins */}
                                        <TableCell
                                            align="left"
                                            padding='none'
                                            sx={{
                                                maxWidth: "22vw",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                flexWrap: 'nowrap',
                                                gap: 0.5,
                                                overflow: 'auto',
                                                scrollbarWidth: 'none',
                                                '&::-webkit-scrollbar': { display: 'none' },
                                                py: 0.5,
                                            }}>
                                                {getEnabledPlugins().map((plug, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={__(plug)}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 500,
                                                            backgroundColor: 'rgba(93,106,247,0.1)',
                                                            color: '#7b87f9',
                                                            border: '1px solid rgba(93,106,247,0.2)',
                                                            '& .MuiChip-label': { px: 0.8 },
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {Object.entries(status).map(([key, value], index) => {
                                                    if (['id', 'hasError'].includes(key))
                                                        value = undefined

                                                    return value > 0 ? (
                                                        <Box key={index} sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            backgroundColor: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(255,255,255,0.07)',
                                                            borderRadius: '7px',
                                                            px: 1,
                                                            py: 0.5,
                                                            minWidth: '44px',
                                                        }}>
                                                            <Typography sx={{ color: '#8b8fa8', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                                                                {__(key)}
                                                            </Typography>
                                                            <Typography sx={{ color: '#f0f0f5', fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.4 }}>
                                                                {value}
                                                            </Typography>
                                                        </Box>
                                                    ) : null
                                                })}
                                            </Box>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="right" padding='none' sx={{ pr: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => handleResourcesOpen(status)}
                                                    sx={{ fontSize: '0.75rem', px: 1 }}
                                                >
                                                    {__("resources")}
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => {
                                                        ws.send(JSON.stringify([ErrorType.Success, ActionType.GetLogs, row]))
                                                        handleLogOpen()
                                                    }}
                                                    sx={{ fontSize: '0.75rem', px: 1 }}
                                                >
                                                    {__("logs")}
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedUser(row)
                                                        setOpenSettings(true)
                                                    }}
                                                    sx={{ fontSize: '0.75rem', px: 1 }}
                                                >
                                                    {__("settings")}
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => {
                                                        row.state = !state
                                                        ws.send(JSON.stringify([ErrorType.Success, ActionType.SetUser, row]))
                                                        setState(!state)
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
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #c0392b, #a93226)',
                                                                boxShadow: '0 4px 16px rgba(240,74,74,0.45)',
                                                            },
                                                        } : {}),
                                                    }}
                                                >
                                                    {state ? __("stop") : __("start")}
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            return <PlayerRow key={row.id} />
                        })}

                        {/* Remove row */}
                        {selected.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ borderBottom: 'none', py: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#8b8fa8', fontSize: '0.75rem' }}>
                                        {selected.length} player{selected.length > 1 ? 's' : ''} selected
                                    </Typography>
                                </TableCell>
                                <TableCell align='right' padding='none' sx={{ borderBottom: 'none', pr: 1.5, py: 1 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="error"
                                        sx={{
                                            background: 'rgba(240,74,74,0.15)',
                                            color: '#f04a4a',
                                            border: '1px solid rgba(240,74,74,0.3)',
                                            boxShadow: 'none',
                                            fontSize: '0.75rem',
                                            height: '28px',
                                            '&:hover': {
                                                background: 'rgba(240,74,74,0.25)',
                                                boxShadow: 'none',
                                            },
                                        }}
                                        onClick={() => {
                                            ws.send(JSON.stringify([ErrorType.Success, ActionType.RemoveUser, rows.filter((e) => selected.includes(e.id))]))
                                        }}
                                    >
                                        {__("remove")}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
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