import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popper,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
    onSearch: (query: string) => void;
    loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Load search history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('smart-search-history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed)) {
                    setHistory(parsed);
                }
            } catch (err) {
                console.error('Failed to parse search history:', err);
            }
        }
    }, []);

    // Save to history
    const addToHistory = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        const newHistory = [
            searchQuery,
            ...history.filter(h => h !== searchQuery)
        ].slice(0, 10); // Keep only 10 recent searches

        setHistory(newHistory);
        localStorage.setItem('smart-search-history', JSON.stringify(newHistory));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !loading) {
            addToHistory(query);
            onSearch(query);
            setFocused(false);
        }
    };

    const handleHistoryClick = (historyQuery: string) => {
        setQuery(historyQuery);
        onSearch(historyQuery);
        setFocused(false);
    };

    const handleClear = () => {
        setQuery('');
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ position: 'relative', width: '100%', maxWidth: 600 }}
            ref={searchRef}
        >
            <Paper
                elevation={focused ? 4 : 1}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '2px solid',
                    borderColor: focused ? 'text.primary' : 'transparent',
                    bgcolor: 'background.paper',
                }}
            >
                {/* AI Sparkle Icon */}
                <AutoAwesomeIcon
                    sx={{
                        color: 'text.primary',
                        mr: 1,
                        animation: loading ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                        },
                    }}
                />

                {/* Search Input */}
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Search for your dream property..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    disabled={loading}
                    InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: '1.1rem' },
                        endAdornment: query && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={handleClear}
                                    edge="end"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Search Button */}
                <IconButton
                    type="submit"
                    disabled={loading || !query.trim()}
                    sx={{ color: 'text.primary' }}
                >
                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                </IconButton>
            </Paper>

            {/* Search History Dropdown */}
            <Popper
                open={focused && history.length > 0 && !query}
                anchorEl={searchRef.current}
                placement="bottom-start"
                style={{ width: searchRef.current?.clientWidth, zIndex: 1300 }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        mt: 1,
                        maxHeight: 400,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <List>
                        {history.slice(0, 5).map((item, index) => (
                            <ListItem
                                key={index}
                                onClick={() => handleHistoryClick(item)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <HistoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item}
                                    primaryTypographyProps={{
                                        sx: { fontSize: '0.95rem', color: 'text.primary' }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Popper>
        </Box>
    );
};

export default SearchBar;
