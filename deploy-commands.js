const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 명령어 수집
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`명령어 수집됨: ${command.data.name}`);
    } else {
        console.log(`[경고] ${filePath}의 명령어에 필수 "data" 또는 "execute" 속성이 없습니다.`);
    }
}

// Discord API에 명령어 등록
const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`${commands.length}개의 슬래시 명령어를 등록하는 중...`);

        // 길드별 명령어 등록 (개발용 - 즉시 반영)
        if (config.guildId) {
            const data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands },
            );
            console.log(`${data.length}개의 길드 슬래시 명령어가 성공적으로 등록되었습니다.`);
        }

        // 글로벌 명령어 등록 (프로덕션용 - 1시간 후 반영)
        // const data = await rest.put(
        //     Routes.applicationCommands(config.clientId),
        //     { body: commands },
        // );
        // console.log(`${data.length}개의 글로벌 슬래시 명령어가 성공적으로 등록되었습니다.`);

    } catch (error) {
        console.error('명령어 등록 중 오류 발생:', error);
    }
})();

