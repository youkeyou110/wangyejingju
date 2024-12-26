export const defaultTemplates = [
  {
    id: 'simple_white',
    name: '简约白',
    style: {
      background: {
        type: 'color',
        value: '#ffffff'
      },
      font: {
        family: 'Microsoft YaHei',
        size: '16px',
        color: '#000000',
        weight: 'normal',
        lineHeight: '1.5',
        letterSpacing: '0'
      },
      layout: {
        padding: '20px',
        textAlign: 'left'
      },
      effects: {}
    }
  },
  {
    id: 'elegant_gray',
    name: '优雅灰',
    style: {
      background: {
        type: 'color',
        value: '#f3f4f6'
      },
      font: {
        family: 'SimSun',
        size: '18px',
        color: '#374151',
        weight: '300',
        lineHeight: '1.8',
        letterSpacing: '1px'
      },
      layout: {
        padding: '30px',
        textAlign: 'center'
      },
      effects: {
        shadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }
  },
  {
    id: 'modern_blue',
    name: '现代蓝',
    style: {
      background: {
        type: 'gradient',
        value: 'linear-gradient(45deg, #1a73e8, #4285f4)'
      },
      font: {
        family: 'Arial',
        size: '20px',
        color: '#ffffff',
        weight: '500',
        lineHeight: '1.6',
        letterSpacing: '0.5px'
      },
      layout: {
        padding: '25px',
        textAlign: 'left'
      },
      effects: {
        shadow: '0 4px 6px rgba(0,0,0,0.2)'
      }
    }
  },
  {
    id: 'vintage_brown',
    name: '复古棕',
    style: {
      background: {
        type: 'color',
        value: '#f5e6d3'
      },
      font: {
        family: 'KaiTi',
        size: '22px',
        color: '#4b3621',
        weight: 'normal',
        lineHeight: '2',
        letterSpacing: '2px'
      },
      layout: {
        padding: '35px',
        textAlign: 'center'
      },
      effects: {
        border: '2px solid #8b7355'
      }
    }
  },
  {
    id: 'dark_theme',
    name: '暗夜黑',
    style: {
      background: {
        type: 'color',
        value: '#1f2937'
      },
      font: {
        family: 'Microsoft YaHei',
        size: '18px',
        color: '#e5e7eb',
        weight: '300',
        lineHeight: '1.7',
        letterSpacing: '1px'
      },
      layout: {
        padding: '28px',
        textAlign: 'left'
      },
      effects: {
        shadow: '0 0 10px rgba(255,255,255,0.1)'
      }
    }
  }
];
