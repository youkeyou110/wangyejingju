const defaultTemplates = [
    {
        id: 'simple',
        name: '简约模板',
        thumbnail: 'images/templates/simple.png',
        style: {
            background: '#ffffff',
            color: '#333333',
            font: 'Arial',
            fontSize: '16px',
            padding: '20px'
        },
        content: {
            quote: {
                style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }
            },
            author: {
                style: {
                    fontSize: '16px',
                    fontStyle: 'italic'
                }
            }
        }
    },
    {
        id: 'dark',
        name: '深色模板',
        thumbnail: 'images/templates/dark.png',
        style: {
            background: '#2c2c2c',
            color: '#ffffff',
            font: 'Helvetica',
            fontSize: '16px',
            padding: '20px'
        },
        content: {
            quote: {
                style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }
            },
            author: {
                style: {
                    fontSize: '16px',
                    fontStyle: 'italic',
                    color: '#cccccc'
                }
            }
        }
    }
];

export default defaultTemplates;
