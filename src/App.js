import ReconnectingWebSocket from "reconnecting-websocket"
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CircularProgress } from '@mui/material'
import { useCookies } from 'react-cookie'
import * as React from 'react'
import './App.css'
import { ErrorType, GetErrorTypeName, ActionType, User } from "./types.js"
import GGEUserTable from './modules/GGEUsersTable'
import settings from './settings.json'

function GrabAssets() {
  const [cookies, setCookie] = useCookies([])
  const [lang, setLang] = React.useState(false)
  const setLanguage = async lang => {
    setCookie("lang", cookies.lang = lang, { maxAge: 31536000 })
    
    try {
      const fetches = await Promise.all([
      new Promise(async (resolve) => {
        const versionResponse = await fetch(`//${window.location.hostname}:${settings.port ?? window.location.port}/ggeProxyEmpire5/config/languages/version.json`)
        const versionData = await versionResponse.json()
        const version = versionData?.languages?.[lang]
        resolve(fetch(`//${window.location.hostname}:${settings.port ?? window.location.port}/ggeProxyEmpire5/config/languages/${version}/${lang}.json`))
      }),
      fetch(
        `//${window.location.hostname}:${window.location.port}/locales/${lang}.json`)])
      const langFile = {}
      for (let i = 0; i < fetches.length; i++) {
        const response = fetches[i]
        
        Object.assign(langFile, await response.json())
      }
      setLang(langFile)
    }
    catch (e) {
      throw new Error("Failed to load language.\n\n" + e)
    }
  }

  if (lang === false) {
    setLanguage(cookies.lang ?? "en")

    return (
      <div className="gge-loading">
        <CircularProgress
          size={40}
          thickness={3}
          sx={{ color: '#5d6af7' }}
        />
        <span className="gge-loading-text">Loading GGE Bot…</span>
      </div>
    )
  }
  const __ = key => {
    return lang[key] || key
  }
  return <App setLanguage={setLanguage} languageCode={cookies.lang} __={__} />
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5d6af7',
      light: '#7b87f9',
      dark: '#4752e0',
    },
    secondary: {
      main: '#7b5cf5',
    },
    background: {
      default: '#0d0e14',
      paper: '#13141c',
    },
    text: {
      primary: '#f0f0f5',
      secondary: '#8b8fa8',
      disabled: '#484c66',
    },
    error: {
      main: '#f04a4a',
    },
    success: {
      main: '#3ecf8e',
    },
    divider: 'rgba(255,255,255,0.07)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, letterSpacing: '0.01em' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2e3152',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#5d6af7',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(19, 20, 28, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(15, 16, 25, 0.5)',
            color: '#8b8fa8',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          color: '#f0f0f5',
          fontSize: '0.85rem',
          padding: '14px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.03)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(93, 106, 247, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(93, 106, 247, 0.12)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.82rem',
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5d6af7 0%, #7b5cf5 100%)',
          boxShadow: '0 4px 16px rgba(93,106,247,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4752e0 0%, #6a4de0 100%)',
            boxShadow: '0 6px 22px rgba(93,106,247,0.45)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(93,106,247,0.5)',
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: '#5d6af7',
            backgroundColor: 'rgba(93,106,247,0.08)',
          },
        },
        text: {
          color: '#8b8fa8',
          '&:hover': {
            color: '#5d6af7',
            backgroundColor: 'rgba(93,106,247,0.06)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
        sizeSmall: {
          height: 22,
          fontSize: '0.7rem',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(93,106,247,0.08)',
          },
          '&.Mui-checked': {
            color: '#5d6af7',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            backgroundColor: 'rgba(255,255,255,0.02)',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5d6af7',
              boxShadow: '0 0 0 4px rgba(93,106,247,0.12)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#8b8fa8',
            '&.Mui-focused': {
              color: '#5d6af7',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.02)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: '1.5px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5d6af7',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1b25',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          borderRadius: 12,
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          borderRadius: 6,
          margin: '2px 0',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(93,106,247,0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(93,106,247,0.15)',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(93,106,247,0.2)',
            },
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(4, 4, 8, 0.8)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#5d6af7',
          height: 6,
        },
        thumb: {
          width: 16,
          height: 16,
          transition: 'all 0.2s ease',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 8px rgba(93,106,247,0.16)',
          },
          '&:before': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
        track: {
          border: 'none',
          background: 'linear-gradient(90deg, #5d6af7, #7b5cf5)',
        },
        rail: {
          opacity: 0.1,
          backgroundColor: '#fff',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1a1b25',
          color: '#f0f0f5',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '6px 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
        arrow: {
          color: '#1a1b25',
          '&:before': {
            border: '1px solid rgba(255,255,255,0.1)',
          },
        },
      },
    },
  },
})

function App({setLanguage, languageCode, __}) {
  const [users, setUsers] = React.useState([])
  const [usersStatus, setUsersStatus] = React.useState({})
  const [plugins, setPlugins] = React.useState([])
  const [channelInfo, setChannelInfo] = React.useState([])
  let ws = React.useMemo(() => {
    const usersStatus = {}
    const ws = new ReconnectingWebSocket(`${window.location.protocol === 'https:' ? "wss" : "ws"}://${window.location.hostname}:${settings.port ?? window.location.port}`, [], { WebSocket: WebSocket, minReconnectionDelay: 3000 })

    ws.addEventListener("message", (msg) => {
      let [err, action, obj] = JSON.parse(msg.data.toString())
      if (err)
        console.error(GetErrorTypeName(err))

      switch (Number(action)) {
        case ActionType.GetUUID:
          if(err === ErrorType.Unauthenticated)
          return window.location.href = "signin.html"
          break
        case ActionType.GetChannels:
          setChannelInfo(obj ?? [])
          break
        case ActionType.GetUsers:
          if (err !== ErrorType.Success)
            return

          setUsers(obj[0].map(e => new User(e)))
          setPlugins(obj[1])
          break
        case ActionType.StatusUser:
          usersStatus[obj.id] = obj
          setUsersStatus(structuredClone(usersStatus))
          break
        default:
          return
      }
    })
    return ws
  }, [])

  return (
    <div className="App">
      <ThemeProvider theme={darkTheme}>
        <GGEUserTable ws={ws} plugins={plugins} rows={users} usersStatus={usersStatus} channelInfo={channelInfo} setLanguage={setLanguage} languageCode={languageCode} __={__} />
      </ThemeProvider>
    </div>
  )
}

export default GrabAssets
