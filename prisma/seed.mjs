import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Provided name lists (deduped on insert)
const GROUP1 = [
  'Andi Fernando','Anggiat','Desy','Egi','Immanuel Gerardi','Juanita Marcella','Lisbeth','Loide Marnida','Magdalena Sianturi','Mariaty Dolemina','Martin Luther Sinaga','Nelson Sihombing','Pieter Nathanael','Samantha','Sondang','Sri Rezeki Magdalena Sihombing','Subrianto','Viona','Yeni YDG','Zaza'
];
const GROUP2 = [
  'Paulus Christofel S','Rifqi Pratama','Beniah','Marvel','Nathan','Aldo','Joshua L','Metthew','Joshua Sianturi','Yoseph','Grace','Farren','Sheren','Listra','Derric','Erica','Obed','Petra','Moses','Andika','Axel','Revi','Niel','Jeven','Mario','Julianto','Juju','Parlin','Boyan','Endang','Andy','Andry','Ferdinan','Asen','Petrus','Erwin','Roni','Jo','Budhi Purnama'
];
const GROUP3 = [
  'Sorta','Rianida','Rianida','Sahata','Duma','Febrina','Dennis','Jenni','Ervina','Rouli','Khaterine','Amy','Vania','Puteri','Joceline','Mesri','Samuel','Paula','Diana','Angel','Mely','Naulida','Efraim','Endah','Ina','Melva'
];
const GROUP4 = [
  'Yuli','Mey','Lasma','Sele','Cika','Debo','Intan','Lisbet','Ayu','Intan','Renti'
];

const ALL = Array.from(new Set([...GROUP1, ...GROUP2, ...GROUP3, ...GROUP4].map((s)=>s.trim()).filter(Boolean)));

async function main() {
  for (const name of ALL) {
    await prisma.person.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  const count = await prisma.person.count();
  console.log('Seed complete. People count =', count);
}

main().then(()=>prisma.$disconnect()).catch((e)=>{console.error(e);process.exit(1)});
