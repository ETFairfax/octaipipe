let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  const cmd = JSON.parse(input).tool_input?.command ?? '';   
  const bare = cmd.replace(/"[^"]*"|'[^']*'/g, '""');
 
  if (/(^|[\s;&|(])(python3?|pip3?)\b/.test(bare)) {
    console.error('Python is not available here. Use node instead.');
    process.exit(2);
  }

  if (/(^|[\s;&|(])(npm|npx)\b/.test(bare)) {
    console.error('This project uses pnpm. Use pnpm / pnpm dlx instead of npm / npx.');
    process.exit(2);
  }

  if (/(^|[\s;&|(])(powershell|pwsh|cmd(\.exe)?)\b/i.test(bare)) {
    console.error('Run commands directly in Git Bash, not via powershell/cmd.');
    process.exit(2);
  }
  if (/\b[A-Z]:\\/i.test(cmd)) {
    console.error('Use Unix-style paths like /c/Users/..., not C:\\Users\\...');
    process.exit(2);
  }
  if (/(^|[\s;&|(])(dir|del|copy|move|type|Get-\w+|Set-\w+|Remove-Item|New-Item)\b/.test(bare)) {
    console.error('Use bash commands (ls, rm, cp, mv, cat), not cmd/PowerShell commands.');
    process.exit(2);
  }

  process.exit(0);
});