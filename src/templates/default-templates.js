const defaultTemplates = [
    {
        id: 'simple',
        name: '__MSG_templateSimple__',
        thumbnail: 'icons/template-simple.png',
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
        name: '__MSG_templateDark__',
        thumbnail: 'icons/template-dark.png',
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
