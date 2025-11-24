# Frontend Tool Integration Test Guide

This guide helps you test the new AI tool controls in the chatbot interface.

## 🛠️ Tool Controls Overview

### Location of Controls
- **Header**: Look for the ⚙️ (settings) icon next to the model selector
- **Popover**: Click the settings icon to open the tool control panel
- **Badge**: Shows number of enabled tools

### Available Tools
1. **🔍 Web Search** - Search the web for current information
2. **📍 Location Intelligence** - Convert addresses and provide location data  
3. **📊 Property Analysis** - Analyze market data using internal information

## 🧪 Testing Instructions

### 1. Visual Interface Test
1. **Sign in** to the application
2. **Locate** the ⚙️ settings icon in the header (next to model selector)
3. **Click** the settings icon to open the tool panel
4. **Verify** you see:
   - List of 3 tools with descriptions
   - Toggle switches for each tool
   - Status indicators (Active/Limited/Disabled)
   - Usage counters (if any)

### 2. Tool Toggle Test
1. **Open** the tool control panel
2. **Disable** the Web Search tool using the toggle
3. **Verify** the badge count decreases (e.g., from 3/3 to 2/3)
4. **Re-enable** the Web Search tool
5. **Verify** the badge count increases back

### 3. Tool Usage Detection Test

#### Web Search Tool
Try these messages to trigger web search:
- "What are the latest property trends in Australia?"
- "Find current information about Sydney real estate"
- "Search for recent news about property investment"
- "Tell me about today's market conditions"

#### Location Intelligence Tool  
Try these messages to trigger geocoding:
- "Where is Circular Quay Sydney?"
- "Find the location of 123 Collins Street Melbourne"
- "Tell me about properties in Bondi Beach"
- "What suburb is 2000 postcode?"

#### Property Analysis Tool
Try these messages to trigger property analysis:
- "Analyze the investment potential of Brisbane properties"
- "What's the market analysis for Sydney apartments?"
- "Show me comparable sales data"
- "Property value trends in Melbourne"

### 4. Usage Tracking Test
1. **Open** the tool control panel (should show 0 usage initially)
2. **Send** a message that triggers tools (e.g., "Latest Sydney property news")
3. **Wait** for the AI response to complete
4. **Re-open** the tool control panel
5. **Verify** usage counters have increased
6. **Check** the session stats show total tool calls

### 5. Tool Status Indicator Test
1. **Look** for the settings icon badge showing enabled tool count
2. **Disable** one tool and verify badge updates
3. **Send** messages and verify usage stats appear
4. **Hover** over the settings icon to see tooltip

## 🎯 Expected Behaviors

### Tool Detection Logic
- **Web Search**: Triggered by keywords like "search", "find", "latest", "current", "news", "what is", "how to", etc.
- **Location Intelligence**: Triggered by location-related keywords like "address", "location", "where is", "suburb", city names, etc.
- **Property Analysis**: Triggered by analysis keywords like "market analysis", "investment", "comparable sales", etc.

### Visual Feedback
- **Badge**: Shows X/Y format (enabled/total)
- **Usage Stats**: Displays in blue highlight box when tools are used
- **Status Icons**: Green checkmark (active), yellow warning (limited), red error (disabled)
- **Real-time Updates**: Usage counters update immediately after tool use

### Tool Panel Features
- **Compact View**: Minimal space usage with expand/collapse
- **Detailed View**: Full descriptions, features, and usage stats
- **Smart Detection**: Automatically tracks tool usage based on message content
- **Session Tracking**: Maintains usage counts during chat session

## 🐛 Troubleshooting

### If Tools Don't Appear
- Ensure you're signed in
- Check browser console for errors
- Refresh the page

### If Usage Tracking Doesn't Work
- Verify tools are enabled
- Check that your message contains trigger keywords
- Look for console logs showing tool detection

### If Toggle Switches Don't Work
- Check network tab for API calls
- Verify authentication status
- Check browser console for errors

## 📊 Success Criteria

✅ **Visual Integration**: Tool controls appear in header  
✅ **Interactive Controls**: Can toggle tools on/off  
✅ **Usage Detection**: Messages trigger appropriate tools  
✅ **Real-time Updates**: Usage counters update correctly  
✅ **Status Management**: Tool states persist during session  
✅ **Intuitive UX**: Easy to understand and use  

## 🚀 Advanced Testing

### Edge Cases
- **Disabled Tools**: Verify disabled tools don't increment usage
- **Multiple Triggers**: Messages that trigger multiple tools
- **Long Sessions**: Extended usage tracking accuracy
- **Network Issues**: Graceful handling of API failures

### Performance
- **Responsive UI**: Tool panel opens/closes smoothly
- **Memory Usage**: No memory leaks during extended use
- **Network Efficiency**: Minimal API calls for tool management

---

**Note**: This is a frontend-only test. The actual tool execution (web search, geocoding) happens on the backend and requires the backend services to be running with proper configuration.