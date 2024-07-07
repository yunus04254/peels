// Add system defined templates to the database
async function seedTemplates(sequelize) {
    await sequelize.models.Template.findOrCreate({
        where: { name: 'Empty Entry' },
        defaults: {
            name: 'Empty Entry',
            description: 'An empty template, ready to be filled with your thoughts and feelings.',
            isDefault: true
        }
    })
    await sequelize.models.Template.findOrCreate({
        where: { name: 'Holiday' },
        defaults: {
            name: 'Holiday',
            description: 'A template for your holiday memories.',
            isDefault: true,
            content: '{"ops":[{"attributes":{"color":"#bbbbbb"},"insert":"Last week I went to.."},{"insert":"\\n\\n\\nWhat was your favourite thing about the trip?\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"I particularly loved the vibrant atmosphere and people...."},{"insert":"\\n\\nWhat food did you eat?\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"I went to the restaurant .... and I loved their ...."},{"insert":"\\n\\nWhat places did you visit?\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"On my first day, I visited the ...."},{"insert":"\\n\\n"}]}'
        }
    })
    await sequelize.models.Template.findOrCreate({
        where: { name: 'Fitness' },
        defaults: {
            name: 'Fitness',
            description: 'A template for logging your fitness activities',
            isDefault: true,
            content: '{"ops":[{"insert":"My exercise routine for this month..\\n\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Week 1"},{"insert":"\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Deadlift...."},{"attributes":{"list":"bullet"},"insert":"\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Week 2"},{"insert":"\\n\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Week 3"},{"insert":"\\n\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Week 4"},{"insert":"\\n\\n"}]}'
        }
    })
    await sequelize.models.Template.findOrCreate({
        where: { name: 'Wellbeing' },
        defaults: {
            name: 'Wellbeing',
            description: 'A template for your thoughts on your wellbeing.',
            isDefault: true,
            content: '{"ops":[{"attributes":{"color":"#bbbbbb"},"insert":"One thing I am grateful for today is..."},{"insert":"\\n\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"One thing I want to improve on today is..."},{"insert":"\\n\\n"},{"attributes":{"underline":true,"bold":true},"insert":"How do you feel?"},{"insert":"\\n\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Today I feel like .... because ...."},{"insert":"\\n\\n"}]}'
        }
    })
    await sequelize.models.Template.findOrCreate({
        where: { name: 'Activity' },
        defaults: {
            name: 'Activity',
            description: 'A template for your thoughts on your activities.',
            isDefault: true,
            content:'{"ops":[{"attributes":{"color":"#bbbbbb"},"insert":"Today I went to..."},{"insert":"\\n\\n"},{"attributes":{"underline":true,"bold":true},"insert":"Things you liked/disliked?"},{"insert":"\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"I liked/disliked it because..."},{"insert":"\\n\\n"},{"attributes":{"underline":true,"bold":true},"insert":"Conclusion"},{"insert":"\\n"},{"attributes":{"color":"#bbbbbb"},"insert":"Overall, Id like/not like to go again because.."},{"insert":"\\n\\n"}]}'
        }
    })
    
    
}

module.exports = { seedTemplates };