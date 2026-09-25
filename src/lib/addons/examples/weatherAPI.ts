import { Addon } from '@/lib/addons'

export const exampleWeatherAddon: Addon = {
  metadata: {
    id: 'example-weather-api',
    name: 'Weather API Integration',
    version: '1.0.0',
    author: 'Example Author',
    description: 'Fetch weather data from external APIs',
    category: 'custom',
    enabled: false,
    tags: ['api', 'weather', 'external'],
    homepage: 'https://example.com/weather-addon',
  },
  nodes: [
    {
      type: 'weather-current',
      label: 'Current Weather',
      category: 'Custom',
      inputs: [
        {
          id: 'city',
          label: 'City Name',
          type: 'text',
          required: true,
        },
        {
          id: 'country',
          label: 'Country Code',
          type: 'text',
        },
      ],
      outputs: [
        {
          id: 'weather',
          label: 'Weather Data',
          type: 'object',
        },
        {
          id: 'temperature',
          label: 'Temperature',
          type: 'number',
        },
        {
          id: 'description',
          label: 'Description',
          type: 'text',
        },
      ],
      config: [
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          description: 'Your weather API key from the provider',
          placeholder: 'Enter your API key',
        },
        {
          id: 'units',
          label: 'Temperature Units',
          type: 'select',
          options: [
            { label: 'Celsius', value: 'metric' },
            { label: 'Fahrenheit', value: 'imperial' },
            { label: 'Kelvin', value: 'standard' },
          ],
          defaultValue: 'metric',
        },
      ],
      execute: async (inputs, config) => {
        try {
          const city = inputs.city
          const country = inputs.country || ''
          const location = country ? `${city},${country}` : city
          
          const mockWeatherData = {
            city: city,
            country: country,
            temperature: Math.round(Math.random() * 30 + 5),
            description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: Math.round(Math.random() * 100),
            windSpeed: Math.round(Math.random() * 20),
            units: config.units,
          }
          
          return {
            weather: mockWeatherData,
            temperature: mockWeatherData.temperature,
            description: mockWeatherData.description,
          }
        } catch (error) {
          throw new Error(`Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      },
    },
    {
      type: 'weather-forecast',
      label: 'Weather Forecast',
      category: 'Custom',
      inputs: [
        {
          id: 'city',
          label: 'City Name',
          type: 'text',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'forecast',
          label: 'Forecast Data',
          type: 'array',
        },
      ],
      config: [
        {
          id: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
        },
        {
          id: 'days',
          label: 'Number of Days',
          type: 'number',
          defaultValue: 5,
          description: 'Number of days to forecast (1-7)',
        },
      ],
      execute: async (inputs, config) => {
        const days = Math.min(Math.max(config.days || 5, 1), 7)
        
        const forecast = Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          temperature: Math.round(Math.random() * 30 + 5),
          description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        }))
        
        return { forecast }
      },
    },
  ],
  initialize: async () => {
    console.log('Weather API addon initialized')
  },
  cleanup: async () => {
    console.log('Weather API addon cleaned up')
  },
}
