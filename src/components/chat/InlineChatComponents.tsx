import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  Collapse,
  IconButton,
  Stack,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Tune as TuneIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

interface DialogState {
  status: 'active' | 'submitted' | 'expired';
  selectedOption?: string;
  customInput?: string;
  submittedAt?: Date;
}

interface BaseInlineComponentProps {
  dialogState: DialogState;
  onResponse: (response: string) => void;
  className?: string;
}

// Session Transition Confirmation Component
interface SessionTransitionProps extends BaseInlineComponentProps {
  message: string;
  options: string[];
  transitionType?: 'property_drill' | 'comparison';
  benefits?: string;
}

export const InlineSessionTransition: React.FC<SessionTransitionProps> = ({
  dialogState,
  onResponse,
  message,
  options = ['Yes, let\'s do it', 'Not now'],
  transitionType,
  benefits,
  className,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const isActive = dialogState.status === 'active';
  const isSubmitted = dialogState.status === 'submitted';

  const handleCustomResponse = () => {
    if (customText.trim()) {
      onResponse(customText.trim());
      setCustomText('');
      setShowCustom(false);
    }
  };

  const getTransitionIcon = () => {
    switch (transitionType) {
      case 'property_drill':
        return '🔍';
      case 'comparison':
        return '⚖️';
      default:
        return '🤖';
    }
  };

  return (
    <Paper
      className={className}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: isSubmitted ? 'success.50' : 'info.50',
        opacity: isSubmitted ? 0.8 : 1,
        borderLeft: `4px solid ${isSubmitted ? 'success.main' : 'info.main'}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
      }}
      elevation={isSubmitted ? 1 : 2}
    >
      <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
        <Typography sx={{ fontSize: '1.2em' }}>{getTransitionIcon()}</Typography>
        <Box flex={1}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
          {benefits && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {benefits}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Show Selected Answer if Submitted */}
      {isSubmitted && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'success.100', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Your choice: "{dialogState.selectedOption || dialogState.customInput}"
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: '0.875rem', mr: 0.5, verticalAlign: 'text-top' }} />
            Submitted at {dialogState.submittedAt?.toLocaleTimeString()}
          </Typography>
        </Paper>
      )}

      {/* Active Options (only when active) */}
      {isActive && (
        <>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 1 }}>
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => onResponse(option)}
                variant="contained"
                size="medium"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                }}
              >
                {option}
              </Button>
            ))}
            <Button
              startIcon={<EditIcon />}
              onClick={() => setShowCustom(!showCustom)}
              variant="outlined"
              size="medium"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Custom response
            </Button>
          </Stack>

          <Collapse in={showCustom}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Tell me more about what you'd like to do..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Button
                onClick={handleCustomResponse}
                disabled={!customText.trim()}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Send Custom Response
              </Button>
            </Box>
          </Collapse>
        </>
      )}

      {/* Read-only completion indicator */}
      {isSubmitted && (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          This interaction is complete. Your response has been processed.
        </Typography>
      )}
    </Paper>
  );
};

// Property Dislike Feedback Component
interface DislikeFeedbackProps extends BaseInlineComponentProps {
  propertyAddress?: string;
  commonReasons?: string[];
}

export const InlineDislikeFeedback: React.FC<DislikeFeedbackProps> = ({
  dialogState,
  onResponse,
  propertyAddress = 'this property',
  commonReasons = ['Too expensive', 'Wrong location', 'No outdoor space', 'Poor condition', 'Too small'],
  className,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const isActive = dialogState.status === 'active';
  const isSubmitted = dialogState.status === 'submitted';

  const handleCustomResponse = () => {
    if (customText.trim()) {
      onResponse(customText.trim());
      setCustomText('');
      setShowCustom(false);
    }
  };

  return (
    <Paper
      className={className}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: isSubmitted ? 'grey.100' : 'warning.50',
        opacity: isSubmitted ? 0.8 : 1,
        borderLeft: `4px solid ${isSubmitted ? 'grey.500' : 'warning.main'}`,
        borderRadius: 2,
      }}
      elevation={isSubmitted ? 1 : 2}
    >
      <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
        <Typography sx={{ fontSize: '1.2em' }}>🤔</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          What didn't work about {propertyAddress}? This helps me show you better matches.
        </Typography>
      </Box>

      {isSubmitted && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'success.100', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Your feedback: "{dialogState.selectedOption || dialogState.customInput}"
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Thanks! This helps us improve your recommendations.
          </Typography>
        </Paper>
      )}

      {isActive && (
        <>
          {/* Quick Reason Chips */}
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {commonReasons.map((reason, index) => (
              <Chip
                key={index}
                label={reason}
                onClick={() => onResponse(reason)}
                clickable
                color="warning"
                variant="outlined"
                sx={{
                  '&:hover': {
                    bgcolor: 'warning.100',
                  },
                }}
              />
            ))}
          </Box>

          {/* Custom Details Option */}
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowCustom(!showCustom)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', mb: showCustom ? 1 : 0 }}
          >
            Add specific details
          </Button>

          <Collapse in={showCustom}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., No backyard for kids, too far from schools, needs too much renovation..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Button
                onClick={handleCustomResponse}
                disabled={!customText.trim()}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Send Feedback
              </Button>
            </Box>
          </Collapse>
        </>
      )}

      {isSubmitted && (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Feedback recorded. I'll prioritize properties that better match your preferences.
        </Typography>
      )}
    </Paper>
  );
};

// Filter Suggestion Confirmation Component
interface FilterSuggestionProps extends BaseInlineComponentProps {
  suggestedFilters: Array<{
    label: string;
    value: string;
    type: string;
  }>;
}

export const InlineFilterSuggestion: React.FC<FilterSuggestionProps> = ({
  dialogState,
  onResponse,
  suggestedFilters = [],
  className,
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [customText, setCustomText] = useState('');

  const isActive = dialogState.status === 'active';
  const isSubmitted = dialogState.status === 'submitted';

  const handleCustomResponse = () => {
    if (customText.trim()) {
      onResponse(`customize: ${customText.trim()}`);
      setCustomText('');
      setShowCustomization(false);
    }
  };

  return (
    <Paper
      className={className}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: isSubmitted ? 'grey.100' : 'success.50',
        opacity: isSubmitted ? 0.8 : 1,
        borderLeft: `4px solid ${isSubmitted ? 'grey.500' : 'success.main'}`,
        borderRadius: 2,
      }}
      elevation={isSubmitted ? 1 : 2}
    >
      <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
        <Typography sx={{ fontSize: '1.2em' }}>💡</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          I suggest adding these filters based on your preferences:
        </Typography>
      </Box>

      {/* Filter Preview */}
      {suggestedFilters.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {suggestedFilters.map((filter, index) => (
              <Chip
                key={index}
                label={`${filter.label}: ${filter.value}`}
                color="success"
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Box>
      )}

      {isSubmitted && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'success.100', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Action taken: {dialogState.selectedOption || dialogState.customInput}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Your search filters have been updated accordingly.
          </Typography>
        </Paper>
      )}

      {isActive && (
        <>
          {/* Action Options */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 1 }}>
            <Button
              color="success"
              variant="contained"
              onClick={() => onResponse('apply_all')}
              sx={{ textTransform: 'none' }}
            >
              Apply These Filters
            </Button>
            <Button
              variant="outlined"
              onClick={() => onResponse('no_thanks')}
              sx={{ textTransform: 'none' }}
            >
              No Thanks
            </Button>
            <Button
              startIcon={<TuneIcon />}
              variant="outlined"
              onClick={() => setShowCustomization(!showCustomization)}
              sx={{ textTransform: 'none' }}
            >
              Customize
            </Button>
          </Stack>

          {/* Custom Modification */}
          <Collapse in={showCustomization}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="e.g., Only add outdoor space filter, change school distance to 1km..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Button
                onClick={handleCustomResponse}
                disabled={!customText.trim()}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Apply Custom Filters
              </Button>
            </Box>
          </Collapse>
        </>
      )}

      {isSubmitted && (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Filter preferences updated. Future searches will reflect these changes.
        </Typography>
      )}
    </Paper>
  );
};

// Clarification Dialog Component
interface ClarificationProps extends BaseInlineComponentProps {
  question: string;
  missingFields?: string[];
  suggestions?: string[];
}

export const InlineClarification: React.FC<ClarificationProps> = ({
  dialogState,
  onResponse,
  question,
  missingFields = [],
  suggestions = [],
  className,
}) => {
  const [customText, setCustomText] = useState('');

  const isActive = dialogState.status === 'active';
  const isSubmitted = dialogState.status === 'submitted';

  const handleCustomResponse = () => {
    if (customText.trim()) {
      onResponse(customText.trim());
      setCustomText('');
    }
  };

  return (
    <Paper
      className={className}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: isSubmitted ? 'grey.100' : 'warning.50',
        opacity: isSubmitted ? 0.8 : 1,
        borderLeft: `4px solid ${isSubmitted ? 'grey.500' : 'warning.main'}`,
        borderRadius: 2,
      }}
      elevation={isSubmitted ? 1 : 2}
    >
      <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
        <Typography sx={{ fontSize: '1.2em' }}>❓</Typography>
        <Box flex={1}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {question}
          </Typography>
          {missingFields.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Missing: {missingFields.join(', ')}
            </Typography>
          )}
        </Box>
      </Box>

      {isSubmitted && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'success.100', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Your answer: "{dialogState.selectedOption || dialogState.customInput}"
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Got it! Processing your request now...
          </Typography>
        </Paper>
      )}

      {isActive && (
        <>
          {/* Quick Suggestions */}
          {suggestions.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
                Quick suggestions:
              </Typography>
              {suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => onResponse(suggestion)}
                  clickable
                  color="warning"
                  variant="outlined"
                  sx={{
                    '&:hover': {
                      bgcolor: 'warning.100',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Custom Response */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Please provide the missing information..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Button
              onClick={handleCustomResponse}
              disabled={!customText.trim()}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Send Answer
            </Button>
          </Box>
        </>
      )}

      {isSubmitted && (
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Thank you! I have enough information to help you now.
        </Typography>
      )}
    </Paper>
  );
};
