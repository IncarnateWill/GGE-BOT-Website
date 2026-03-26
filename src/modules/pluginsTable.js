import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { Switch, Chip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'

function PluginOption({ pluginData, channels, userPlugins, plugin, __ }) {
    userPlugins[plugin.key] ??= {}
    const [value, setValue] = React.useState(userPlugins[plugin.key][pluginData.key] ?? pluginData.default)

    const onChange = value => {
        userPlugins[plugin.key][pluginData.key] = value
        setValue(value)
    }
    switch (pluginData.type) {
        case "":
            return <></>
        case "Label":
            return <Typography variant="subtitle2" sx={{ width: '100%', borderBottom: '1px solid rgba(144, 202, 249, 0.3)', pb: 0.2, mb: 0.2, color: '#90caf9', mt: 0.5, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>{__(pluginData.key)}</Typography>
        case "Text":
            return <TextField
                fullWidth
                label={__(pluginData.key)}
                variant="outlined"
                size="small"
                
                value={__(value)}
                onChange={e => onChange(e.target.value)}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' }, my: 0.5 }}
            />
        case "Checkbox":
            return <FormControlLabel
                control={<Checkbox size="small" sx={{ p: 0.5, color: '#90caf9', '&.Mui-checked': { color: '#90caf9' } }} />}
                label={<Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{pluginData.hideText ? "" : __(pluginData.key)}</Typography>}
                
                checked={Boolean(value)}
                onChange={(_, newValue) => onChange(newValue)}
                sx={{ mr: 1, ml: 0, '& .MuiFormControlLabel-label': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
            />
        case "Table":
            const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size))
            return <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'rgba(0,0,0,0.1)', mt: 0.5 }}>
                <Table aria-label="simple table" size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {pluginData.row.map((cRow, i) => 
                                <TableCell key={i} sx={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ccc', bgcolor: '#333', py: 0.5 }}>{cRow}</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            array_chunks(pluginData.data, pluginData.row.length).map((e, i) =>
                                <TableRow key={i}>
                                    {
                                        e.map((pluginData, j) => <TableCell key={j} sx={{ py: 0.5 }}>
                                                 <PluginOption 
                                                    pluginData={pluginData}
                                                    channels={channels}
                                                    userPlugins={userPlugins[plugin.key] ??= {}} 
                                                    __={__} 
                                                    plugin={{key : i}}/>
                                            </TableCell>)
                                    }
                                </TableRow>)
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        case "Channel":
            return <FormControl fullWidth size="small" sx={{ my: 0.5 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>{__(pluginData.key)}</InputLabel>
                <Select value={value} label={pluginData.key} onChange={(newValue) => onChange(newValue.target.value)} sx={{ fontSize: '0.75rem' }}>
                    {channels?.map((channel, i) => <MenuItem value={channel.id} key={i} sx={{ fontSize: '0.75rem' }}>{channel.name}</MenuItem>)}
                </Select>
            </FormControl>
        case "Select":
            return <FormControl fullWidth size="small" sx={{ my: 0.5 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>{__(pluginData.key)}</InputLabel>
                <Select value={value} label={pluginData.key} onChange={(newValue) => onChange(newValue.target.value)} sx={{ fontSize: '0.75rem' }}>
                    {pluginData.selection.map((e, i) => <MenuItem value={i} key={i} sx={{ fontSize: '0.75rem' }}>{e}</MenuItem>)}
                </Select>
            </FormControl>
        case "Slider":
            return <Box sx={{ display: "flex", alignItems: "center", width: '100%', my: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 1, fontSize: '0.75rem' }}>{__(pluginData.key)}</Typography>
                <Slider size="small" sx={{ flexGrow: 1 }} value={value} onChange={(_, newValue) => onChange(newValue)} />
                <Typography variant="body2" sx={{ ml: 1, minWidth: '25px', fontSize: '0.75rem' }}>{`${value}%`}</Typography>
            </Box>
        case "Time":
            return <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                    label={__(pluginData.key)}
                    value={value ?? dayjs()}
                    onChange={onChange}
                />
            </LocalizationProvider>
        default:
            return null
    }
}
const PluginOptionContainer = ({ plugin, channels, userPlugins, __ }) => {
    return <><Typography sx={{ width: '100%', pb: 0.2, mb: 0.2, mt: 0.5, fontWeight: 'bold', fontSize: '0.85rem' }}>{__(plugin.key)}</Typography>
        {
            plugin?.pluginOptions?.map((pluginData, index) => 
                <PluginOption pluginData={pluginData} key={`${plugin.key} ${index}`} channels={channels} userPlugins={userPlugins} __={__} plugin={plugin} />)
        }
    </>
    }
function Plugin({ plugin, __, userPlugins, selectedPlugin, setSelectedPlugin }) {
    userPlugins[plugin.key] ??= {}
    const [state, setState] = React.useState(userPlugins[plugin.key].state)
    const isSelected = plugin === selectedPlugin

    function onClick() {
        if (plugin.pluginOptions?.length > 0)
            setSelectedPlugin(plugin)
    }

    return (
        <TableRow
            onClick={onClick}
            sx={{
                cursor: plugin.pluginOptions?.length > 0 ? 'pointer' : 'default',
                backgroundColor: isSelected ? 'rgba(93, 106, 247, 0.12)' : 'transparent',
                '&:hover': {
                    backgroundColor: isSelected ? 'rgba(93, 106, 247, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                },
                transition: 'all 0.15s ease',
            }}
        >
            <TableCell sx={{ 
                fontWeight: 600, 
                color: isSelected ? '#7b87f9' : '#f0f0f5',
                fontSize: '0.8rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                py: 1.2,
                pl: 2
            }}>
                {__(plugin.key.charAt(0).toUpperCase() + plugin.key.slice(1)) || __(plugin.key)}
                {plugin.pluginOptions?.length > 0 && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#6d7085', fontWeight: 500, fontSize: '0.6rem', mt: 0.2 }}>
                        {isSelected ? "Editing options..." : "Click to edit options"}
                    </Typography>
                )}
            </TableCell>
            <TableCell align='right' sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }}>
                {!plugin.force ?
                    <Switch
                        size="small"
                        checked={state}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            setState(e.target.checked)
                            userPlugins[plugin.key].state = e.target.checked
                        }}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#5d6af7' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5d6af7' }
                        }}
                    /> : 
                    <Chip label="Forced" size="small" sx={{ height: 18, fontSize: '0.6rem', opacity: 0.6 }} />
                }
            </TableCell>
        </TableRow>
    )
}
export default function PluginsTable({ __, userPlugins, plugins, channels }) {
    const [selectedPlugin, setSelectedPlugin] = React.useState(undefined) //, maxHeight: "40vh"

    return (
        <Paper elevation={0} sx={{ 
            minHeight: "40vh", 
            maxHeight: "80vh", 
            backgroundColor: 'rgba(255,255,255,0.02)', 
            display:"flex", 
            flexDirection:"column",
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
        }} >
            <TableContainer sx={{ 
                flex: "0 0 220px",
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '3px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }
            }}>
                <Table stickyHeader aria-label="plugins table" size="small">
                    <TableBody>
                        {plugins.map((plugin, index) =>
                            <Plugin
                                plugin={plugin}
                                key={index}
                                userPlugins={userPlugins}
                                __={__}
                                selectedPlugin={selectedPlugin}
                                setSelectedPlugin={setSelectedPlugin}
                            />)}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{
                minWidth:"100%", 
                flex: 1,
                overflowY:"auto", 
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: 'rgba(255,255,255,0.01)',
                p: { xs: 1, sm: 1.5 },
                '&::-webkit-scrollbar': { width: '3px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }
            }}>
                {
                    selectedPlugin ?
                        <PluginOptionContainer userPlugins={userPlugins} channels={channels} __={__} plugin={selectedPlugin} /> :
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>Select a plugin to configure its options</Typography>
                        </Box>
                }
            </Box>
        </Paper>
    )
}