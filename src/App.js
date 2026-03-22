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
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#13141c',
          border: '1px solid rgba(255,255,255,0.07)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#0f1019',
            color: '#8b8fa8',
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
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
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.03)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.01em',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5d6af7 0%, #7b5cf5 100%)',
          boxShadow: '0 4px 16px rgba(93,106,247,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4752e0 0%, #6a4de0 100%)',
            boxShadow: '0 6px 22px rgba(93,106,247,0.45)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(93,106,247,0.5)',
          '&:hover': {
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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.2)',
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
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5d6af7',
              boxShadow: '0 0 0 3px rgba(93,106,247,0.15)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1b25',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          borderRadius: 10,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          '&:hover': {
            backgroundColor: 'rgba(93,106,247,0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(93,106,247,0.15)',
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
          backgroundColor: 'rgba(4, 4, 8, 0.85)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#5d6af7',
        },
        thumb: {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 8px rgba(93,106,247,0.16)',
          },
        },
        track: {
          background: 'linear-gradient(90deg, #5d6af7, #7b5cf5)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#5d6af7',
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
