import * as React from 'react'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useMediaQuery, useTheme } from '@mui/material'

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

        switch (obj2.nodeName) {
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
    if (instanceLocaId)
        instances.push({ id: obj.getAttribute("value"), server, zone, instanceLocaId, instanceName })
}

export default function UserSettings({ __, selectedUser, channels, plugins, ws, closeBackdrop }) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    selectedUser.name ??= ""
    selectedUser.plugins ??= {}
    const isNewUser = selectedUser.name === ""
    const [name, setName] = React.useState(selectedUser.name)
    const [pass, setPass] = React.useState("")
    const [server, setServer] = React.useState(selectedUser.server ?? instances[0].id)
    const [externalEvent, setExternalEvent] = React.useState(selectedUser.externalEvent)

    const usernameLabel = __("username")
    const passwordLabel = __("password")
    const serverLabel = __("server")
    const saveLabel = __("save")

    return (
        <div onClick={event => event.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{
                maxHeight: '94vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: { xs: '96vw', sm: '85vw', md: '750px' },
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                backgroundColor: 'rgba(19, 20, 28, 0.9)',
                backdropFilter: 'blur(20px)',
            }}>
                {/* ── Header ── */}
                <Box sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2.5,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexShrink: 0,
                }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #5d6af7, #7b5cf5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(93,106,247,0.4)',
                        flexShrink: 0,
                    }}>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>
                            {isNewUser ? '+' : (selectedUser.name?.[0]?.toUpperCase() ?? '?')}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: '#f0f0f5',
                            lineHeight: 1.1,
                            letterSpacing: '-0.01em',
                        }}>
                            {isNewUser ? (__("addPlayer") || "Add Player") : `${__("settings")} – ${selectedUser.name}`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#8b8fa8', fontWeight: 500, mt: 0.3 }}>
                            {isNewUser ? "Configure a new bot account" : "Manage account configuration"}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Body ── */}
                <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '5px' } }}>
                    {/* Account details section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" sx={{
                            color: '#5d6af7',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            letterSpacing: '0.12em',
                            display: 'block',
                            mb: 2,
                        }}>
                            Account Details
                        </Typography>

                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                            gap: 2,
                            alignItems: 'flex-start'
                        }}>
                            <TextField
                                required
                                fullWidth
                                size="small"
                                label={usernameLabel}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={!isNewUser}
                            />
                            <TextField
                                required
                                fullWidth
                                size="small"
                                label={passwordLabel}
                                type='password'
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                            />

                            <FormControl fullWidth size="small">
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
                                    px: 2,
                                    py: 0.8,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    transition: 'all 0.2s ease',
                                    height: '40px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(93,106,247,0.08)',
                                        borderColor: 'rgba(93,106,247,0.3)',
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
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#c0c4d8' }}>
                                        OR / BTH Protocol
                                    </Typography>
                                }
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 4 }} />

                    {/* Plugins section */}
                    <Box>
                        <Typography variant="overline" sx={{
                            color: '#5d6af7',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            letterSpacing: '0.12em',
                            display: 'block',
                            mb: 2,
                        }}>
                            Automation Plugins
                        </Typography>

                        <PluginsTable
                            plugins={plugins}
                            userPlugins={selectedUser.plugins}
                            channels={channels}
                            __={__}
                        />
                    </Box>
                </Box>

                {/* ── Footer ── */}
                <Box sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2.5,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    flexShrink: 0,
                    gap: 2,
                }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#8b8fa8', fontWeight: 500 }}>
                        {isNewUser ? "Required fields marked with *" : `Configuration for ${selectedUser.name}`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                            variant="outlined"
                            fullWidth={isMobile}
                            onClick={closeBackdrop}
                            sx={{
                                px: 3,
                                color: '#8b8fa8',
                                borderColor: 'rgba(255,255,255,0.15)',
                                '&:hover': { borderColor: '#fff' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth={isMobile}
                            sx={{ px: 4, boxShadow: '0 4px 14px rgba(93,106,247,0.4)' }}
                            onClick={async () => {
                                for (const key in selectedUser.plugins) {
                                    if (Object.keys(selectedUser.plugins[key]).length === 0)
                                        delete selectedUser.plugins[key]
                                }
                                let obj = {
                                    name: name,
                                    pass: pass,
                                    server: server,
                                    plugins: selectedUser.plugins,
                                    externalEvent: externalEvent,
                                    state: selectedUser.state
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