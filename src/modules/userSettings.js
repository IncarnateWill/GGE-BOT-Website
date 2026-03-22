import * as React from 'react'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { ErrorType, ActionType } from "../types.js"
import PluginsTable from './pluginsTable'
import settings from '../settings.json'

let servers = new DOMParser()
    .parseFromString(await (await fetch(`${window.location.protocol === 'https:' ? "https" : "http"}://${window.location.hostname}:${settings.port ?? window.location.port}/1.xml`)).text(), "text/xml")
let instances = []
let _instances = servers.getElementsByTagName("instance")

for (var key in _instances) {
    let obj = _instances[key]

    let server, zone, instanceLocaId, instanceName
    
    for (var key2 in obj.childNodes) {
        let obj2 = obj.childNodes[key2]
        
        switch(obj2.nodeName) 
        {
            case "server":
                server = obj2.childNodes[0].nodeValue
                break
            case "zone":
                zone = obj2.childNodes[0].nodeValue
                break
            case "instanceLocaId":
                instanceLocaId = obj2.childNodes[0].nodeValue
                break
            case "instanceName":
                instanceName = obj2.childNodes[0].nodeValue
                break
            default:
        }
    }
    if(instanceLocaId)
        instances.push({id: obj.getAttribute("value"),server,zone,instanceLocaId,instanceName})
}

export default function UserSettings({ __, selectedUser, channels, plugins, ws, closeBackdrop }) {
    selectedUser.name ??= ""
    selectedUser.plugins ??= {}
    const isNewUser = selectedUser.name === ""
    const [name, setName] = React.useState(selectedUser.name)
    const [pass, setPass] = React.useState("")
    const [server, setServer] = React.useState(selectedUser.server ?? instances[0].id)
    const [externalEvent, setExternalEvent] = React.useState(selectedUser.externalEvent)

    const usernameLabel = __("username")
    const passwordLabel = __("password")
    const serverLabel   = __("server")
    const saveLabel     = __("save")

    return (
        <div onClick={event => event.stopPropagation()} style={{ width: 'max-content' }}>
            <Paper sx={{
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: { xs: '95vw', sm: '80vw' },
                maxWidth: '900px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                backgroundColor: '#13141c',
            }}>
                {/* ── Header ── */}
                <Box sx={{
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexShrink: 0,
                }}>
                    <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '7px',
                        background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(93,106,247,0.4)',
                        flexShrink: 0,
                    }}>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>
                            {isNewUser ? '+' : (selectedUser.name?.[0]?.toUpperCase() ?? '?')}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: '#f0f0f5',
                            lineHeight: 1.2,
                        }}>
                            {isNewUser ? (__("addPlayer") || "Add Player") : `${__("settings")} – ${selectedUser.name}`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#484c66', lineHeight: 1 }}>
                            {isNewUser ? "Configure a new bot account" : "Edit account configuration"}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Body ── */}
                <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>
                    {/* Account details section */}
                    <Typography variant="caption" sx={{
                        color: '#5d6af7',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'block',
                        mb: 1.5,
                    }}>
                        Account Details
                    </Typography>

                    <FormGroup
                        row={true}
                        sx={{ mb: 3, gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}
                    >
                        <TextField
                            required
                            size="small"
                            label={usernameLabel}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={!isNewUser}
                            sx={{ minWidth: 160, flex: '1 1 160px' }}
                        />
                        <TextField
                            required
                            size="small"
                            label={passwordLabel}
                            type='password'
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            sx={{ minWidth: 160, flex: '1 1 160px' }}
                        />
                        
                        <FormControl size="small" sx={{ minWidth: 180, flex: '2 1 180px' }}>
                            <InputLabel required id="server-select-label">{serverLabel}</InputLabel>
                            <Select
                                labelId="server-select-label"
                                id="server-select"
                                value={server}
                                label={serverLabel}
                                onChange={(newValue) => setServer(newValue.target.value)}
                            >
                                {
                                    instances.map((server, i) => (
                                        <MenuItem value={server.id} key={i}>
                                            {__(server.instanceLocaId) + ' ' + server.instanceName}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            sx={{
                                m: 0,
                                px: 1.5,
                                py: 0.7,
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                flexShrink: 0,
                                '&:hover': {
                                    backgroundColor: 'rgba(93,106,247,0.06)',
                                    borderColor: 'rgba(93,106,247,0.25)',
                                },
                            }}
                            control={
                                <Checkbox
                                    size="small"
                                    sx={{ p: 0.5, mr: 0.5 }}
                                />
                            }
                            checked={externalEvent}
                            onChange={e => setExternalEvent(e.target.checked)}
                            label={
                                <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#c0c4d8' }}>
                                    OR / BTH
                                </Typography>
                            }
                        />
                    </FormGroup>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />

                    {/* Plugins section */}
                    <Typography variant="caption" sx={{
                        color: '#5d6af7',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'block',
                        mb: 1.5,
                    }}>
                        Plugins
                    </Typography>

                    <PluginsTable
                        plugins={plugins}
                        userPlugins={selectedUser.plugins}
                        channels={channels}
                        __={__}
                    />
                </Box>

                {/* ── Footer ── */}
                <Box sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.015)',
                    flexShrink: 0,
                    gap: 2,
                }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#484c66' }}>
                        {isNewUser ? "Fill all required fields marked with *" : `Editing: ${selectedUser.name}`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={closeBackdrop}
                            sx={{
                                fontSize: '0.8rem',
                                borderColor: 'rgba(255,255,255,0.12)',
                                color: '#8b8fa8',
                                '&:hover': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size='small'
                            sx={{ fontSize: '0.8rem', minWidth: '80px' }}
                            onClick={async () => {
                                for (const key in selectedUser.plugins) {
                                    if(Object.keys(selectedUser.plugins[key]).length == 0)
                                        delete selectedUser.plugins[key]
                                }
                                let obj = {
                                    name: name,
                                    pass: pass,
                                    server: server,
                                    plugins: selectedUser.plugins,
                                    externalEvent: externalEvent
                                }
                                if (!isNewUser) {
                                    obj.id = selectedUser.id
                                    if (pass === "") obj.pass = selectedUser.pass
                                }

                                ws.send(JSON.stringify([
                                    ErrorType.Success,
                                    isNewUser ? ActionType.AddUser : ActionType.SetUser,
                                    obj
                                ]))

                                closeBackdrop()
                            }}
                        >
                            {saveLabel}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </div>
    )
}