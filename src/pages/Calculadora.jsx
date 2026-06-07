import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X, ChevronDown } from "lucide-react";
import { theme as t } from "../styles/theme";

const ADBLUE_RATIO = 0.18925;

const PEAJES = [
  {c:"PE001",n:"ABURRA",d:"ANTIOQUIA",t:{I:27300,II:31700,III:31700,IV:31700,V:71500,VI:91600,VII:108200}},
{c:"PE002",n:"ACAPULCO",d:"CALDAS",t:{I:17600,II:21500,III:21500,IV:21500,V:51700,VI:64700,VII:74700}},
{c:"PE003",n:"AGUAS NEGRAS",d:"SANTANDER",t:{I:16300,II:20500,III:47600,IV:0,V:0,VI:57100,VII:67200}},
{c:"PE004",n:"ALBARRACÍN",d:"CUNDINAMARCA",t:{I:12400,II:13700,III:35400,IV:0,V:0,VI:43700,VII:51400}},
{c:"PE005",n:"ALTAMIRA",d:"HUILA",t:{I:12800,II:14500,III:29600,IV:0,V:0,VI:37800,VII:42700}},
{c:"PE006",n:"ALTO PINO",d:"LA GUAJIRA",t:{I:14800,II:22900,III:18400,IV:29100,V:42500,VI:68300,VII:86200}},
{c:"PE007",n:"ALVARADO",d:"TOLIMA",t:{I:16500,II:17600,III:18400,IV:19100,V:40500,VI:55400,VII:60000}},
{c:"PE008",n:"AMAGÁ",d:"ANTIOQUIA",t:{I:20600,II:24400,III:24400,IV:24400,V:55800,VI:70000,VII:80500}},
{c:"PE009",n:"ANDES",d:"CUNDINAMARCA",t:{I:15200,II:26400,III:17500,IV:37100,V:54500,VI:68900,VII:75900}},
{c:"PE010",n:"ARCABUCO",d:"BOYACA",t:{I:12800,II:13700,III:29300,IV:0,V:0,VI:37200,VII:41800}},
{c:"PE011",n:"ARMERO",d:"TOLIMA",t:{I:16500,II:17800,III:18400,IV:19000,V:40600,VI:55400,VII:76600}},
{c:"PE012",n:"BAYUNCA",d:"BOLÍVAR",t:{I:12600,II:13900,III:30900,IV:0,V:0,VI:41200,VII:47100}},
{c:"PE013",n:"BETANIA",d:"VALLE DEL CAUCA",t:{I:13400,II:17400,III:41000,IV:0,V:0,VI:56000,VII:61800}},
{c:"PE014",n:"BICENTENARIO",d:"CUNDINAMARCA",t:{I:13700,II:17900,III:41600,IV:0,V:0,VI:50400,VII:58500}},
{c:"PE015",n:"BOQUERON I",d:"CUNDINAMARCA",t:{I:20800,II:61400,III:30900,IV:81000,V:91500,VI:101600,VII:121800}},
{c:"PE016",n:"BOQUERON II",d:"CUNDINAMARCA",t:{I:20800,II:61400,III:30900,IV:81000,V:91500,VI:101600,VII:121800}},
{c:"PE017",n:"BRISAS",d:"CUNDINAMARCA",t:{I:7700,II:24800,III:33800,IV:45100,V:64200,VI:103400,VII:118200}},
{c:"PE018",n:"CABILDO",d:"ANTIOQUIA",t:{I:20300,II:22400,III:23800,IV:34500,V:59800,VI:75000,VII:86500}},
{c:"PE019",n:"CAIQUERO",d:"CUNDINAMARCA",t:{I:14200,II:18400,III:45500,IV:0,V:0,VI:54800,VII:62900}},
{c:"PE020",n:"CALAMAR",d:"BOLÍVAR",t:{I:19700,II:24200,III:30200,IV:0,V:0,VI:38200,VII:58100}},
{c:"PE021",n:"CAMBAO",d:"CUNDINAMARCA",t:{I:15300,II:21400,III:29400,IV:39400,V:55600,VI:90100,VII:102900}},
{c:"PE022",n:"CANO",d:"NARIÑO",t:{I:15600,II:16600,III:33900,IV:0,V:0,VI:44600,VII:51400}},
{c:"PE023",n:"CARIMAGUA",d:"CORDOBA",t:{I:18600,II:26600,III:26600,IV:26600,V:48200,VI:76500,VII:88400}},
{c:"PE024",n:"CASABLANCA",d:"CUNDINAMARCA",t:{I:12700,II:13600,III:35200,IV:0,V:0,VI:43600,VII:51100}},
{c:"PE025",n:"CASETABLA",d:"META",t:{I:8300,II:8800,III:9900,IV:9900,V:36700,VI:45300,VII:51200}},
{c:"PE026",n:"CEDROS",d:"CORDOBA",t:{I:19700,II:29100,III:29100,IV:29100,V:52500,VI:83400,VII:96000}},
{c:"PE027",n:"CENCAR",d:"VALLE DEL CAUCA",t:{I:13200,II:16100,III:42600,IV:0,V:0,VI:55500,VII:64000}},
{c:"PE028",n:"CERRITO",d:"VALLE DEL CAUCA",t:{I:13200,II:16100,III:42600,IV:0,V:0,VI:55500,VII:64000}},
{c:"PE029",n:"CERRITOS II",d:"RISARALDA",t:{I:18700,II:21200,III:52100,IV:0,V:0,VI:68100,VII:78000}},
{c:"PE030",n:"CHICORAÍ",d:"TOLIMA",t:{I:16600,II:18300,III:16600,IV:21500,V:43700,VI:58000,VII:64000}},
{c:"PE031",n:"CHINAUTA",d:"CUNDINAMARCA",t:{I:16100,II:17900,III:38000,IV:0,V:0,VI:61700,VII:70700}},
{c:"PE032",n:"CHUSACA",d:"CUNDINAMARCA",t:{I:16100,II:17900,III:38000,IV:0,V:0,VI:61700,VII:70700}},
{c:"PE033",n:"CIAT",d:"VALLE DEL CAUCA",t:{I:13300,II:16200,III:43200,IV:0,V:0,VI:55600,VII:64100}},
{c:"PE034",n:"CIRCASIA",d:"QUINDÍO",t:{I:2100,II:27000,III:27000,IV:27000,V:65500,VI:80400,VII:89400}},
{c:"PE035",n:"CISNEROS",d:"ANTIOQUIA",t:{I:29400,II:35600,III:35600,IV:35600,V:85200,VI:107600,VII:123700}},
{c:"PE036",n:"COCORA",d:"TOLIMA",t:{I:17100,II:18700,III:43300,IV:0,V:0,VI:57800,VII:63800}},
{c:"PE037",n:"COCORNA",d:"ANTIOQUIA",t:{I:18800,II:29300,III:25600,IV:31800,V:63700,VI:90600,VII:90600}},
{c:"PE038",n:"COROZAL",d:"VALLE DEL CAUCA",t:{I:16200,II:19300,III:19300,IV:19300,V:47100,VI:58900,VII:68100}},
{c:"PE039",n:"CORREDOR PORTUARIO",d:"ATLÁNTICO",t:{I:11700,II:13000,III:30300,IV:0,V:0,VI:36400,VII:40500}},
{c:"PE040",n:"CORZO",d:"CUNDINAMARCA",t:{I:11200,II:16700,III:14600,IV:19300,V:32700,VI:44100,VII:47700}},
{c:"PE041",n:"CURITI",d:"SANTANDER",t:{I:12700,II:13600,III:35200,IV:0,V:0,VI:43600,VII:51100}},
{c:"PE042",n:"EL BORDO",d:"CAUCA",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:37900,VII:42900}},
{c:"PE043",n:"EL CARMEN",d:"BOLÍVAR",t:{I:15000,II:17300,III:30600,IV:0,V:0,VI:38900,VII:47900}},
{c:"PE044",n:"EL COPEY",d:"CESAR",t:{I:12200,II:13300,III:31100,IV:0,V:0,VI:40700,VII:47200}},
{c:"PE045",n:"EL CORZO",d:"CUNDINAMARCA",t:{I:12400,II:18500,III:16200,IV:21300,V:36200,VI:48800,VII:52800}},
{c:"PE046",n:"EL CRUCERO",d:"BOYACA",t:{I:12800,II:13700,III:29300,IV:0,V:0,VI:37200,VII:41800}},
{c:"PE047",n:"EL DIFÍCIL",d:"MAGDALENA",t:{I:14100,II:17500,III:36800,IV:0,V:0,VI:52200,VII:55700}},
{c:"PE048",n:"EL EBANAL",d:"LA GUAJIRA",t:{I:14800,II:22900,III:18400,IV:29100,V:42500,VI:68300,VII:86200}},
{c:"PE049",n:"EL KORAN",d:"CUNDINAMARCA",t:{I:19900,II:27700,III:39900,IV:81100,V:100700,VI:100700,VII:119400}},
{c:"PE050",n:"EL PATÁ",d:"HUILA",t:{I:18900,II:23400,III:28900,IV:36600,V:55800,VI:70000,VII:81000}},
{c:"PE051",n:"EL PICACHO",d:"SANTANDER",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:38000,VII:42800}},
{c:"PE052",n:"EL PLACER",d:"NARIÑO",t:{I:20900,II:24400,III:49000,IV:0,V:0,VI:58600,VII:67600}},
{c:"PE053",n:"EL ROBLE",d:"CUNDINAMARCA",t:{I:12400,II:13700,III:35400,IV:0,V:0,VI:43700,VII:51400}},
{c:"PE054",n:"ESTAMBUL",d:"VALLE DEL CAUCA",t:{I:13300,II:16200,III:43200,IV:0,V:0,VI:55600,VII:64100}},
{c:"PE055",n:"FLANDES",d:"TOLIMA",t:{I:17100,II:21200,III:26100,IV:33100,V:50500,VI:63300,VII:73300}},
{c:"PE056",n:"FRAGUA",d:"ANTIOQUIA",t:{I:17600,II:21800,III:21800,IV:21800,V:51600,VI:64700,VII:74600}},
{c:"PE057",n:"FUSCA",d:"CUNDINAMARCA",t:{I:15200,II:26400,III:17500,IV:37100,V:54500,VI:68900,VII:75900}},
{c:"PE058",n:"GALAPA",d:"ATLÁNTICO",t:{I:10600,II:11500,III:24700,IV:0,V:0,VI:31900,VII:35900}},
{c:"PE059",n:"GALAPA PROSPERIDAD",d:"ATLÁNTICO",t:{I:10000,II:14700,III:10800,IV:18600,V:57500,VI:76300,VII:84800}},
{c:"PE060",n:"GAMBOTE",d:"BOLÍVAR",t:{I:12600,II:13900,III:30900,IV:0,V:0,VI:41200,VII:47100}},
{c:"PE061",n:"GUAICO",d:"CALDAS",t:{I:25300,II:31500,III:31500,IV:31500,V:74100,VI:93500,VII:107600}},
{c:"PE062",n:"GUALANDAY",d:"TOLIMA",t:{I:15300,II:18000,III:42400,IV:0,V:0,VI:57000,VII:62500}},
{c:"PE063",n:"GUATAQUÍ",d:"CUNDINAMARCA",t:{I:15300,II:21400,III:29400,IV:39400,V:55600,VI:90100,VII:102900}},
{c:"PE064",n:"GUAYABAL",d:"CUNDINAMARCA",t:{I:20100,II:27600,III:23100,IV:32100,V:57700,VI:74800,VII:89800}},
{c:"PE065",n:"HONDA",d:"TOLIMA",t:{I:16500,II:17600,III:18400,IV:19100,V:40500,VI:55400,VII:60000}},
{c:"PE066",n:"IRACÁ",d:"META",t:{I:15800,II:30500,III:23100,IV:39900,V:59000,VI:77900,VII:84700}},
{c:"PE067",n:"IRRA",d:"CALDAS",t:{I:17600,II:21700,III:21700,IV:21700,V:51600,VI:64700,VII:74600}},
{c:"PE068",n:"JALISCO",d:"CUNDINAMARCA",t:{I:20100,II:27600,III:23100,IV:32100,V:57700,VI:74800,VII:89800}},
{c:"PE069",n:"JUAN MINA",d:"ATLÁNTICO",t:{I:10000,II:14700,III:10800,IV:18600,V:57500,VI:76300,VII:84800}},
{c:"PE070",n:"LA APARTADA",d:"CORDOBA",t:{I:19700,II:29100,III:29100,IV:29100,V:52500,VI:52500,VII:96000}},
{c:"PE071",n:"LA CABAÑA",d:"CUNDINAMARCA",t:{I:13900,II:21700,III:33500,IV:49000,V:0,VI:67100,VII:67500}},
{c:"PE072",n:"LA ESPERANZA",d:"SUCRE",t:{I:11500,II:12400,III:26600,IV:0,V:0,VI:33400,VII:37900}},
{c:"PE073",n:"LA GÓMEZ",d:"SANTANDER",t:{I:16300,II:20500,III:47600,IV:0,V:0,VI:57100,VII:67200}},
{c:"PE074",n:"LA LIBERTAD",d:"META",t:{I:20400,II:39500,III:31600,IV:52000,V:76900,VI:100900,VII:115700}},
{c:"PE075",n:"LA LIZAMA",d:"SANTANDER",t:{I:20100,II:24600,III:30600,IV:38700,V:58900,VI:73500,VII:84900}},
{c:"PE076",n:"LA LOMA",d:"CESAR",t:{I:12500,II:13700,III:29700,IV:0,V:0,VI:38400,VII:43700}},
{c:"PE077",n:"LA PARADA",d:"NORTE DE SANTANDER",t:{I:2800,II:2800,III:2800,IV:0,V:0,VI:2800,VII:2800}},
{c:"PE078",n:"LA PINTADA",d:"ANTIOQUIA",t:{I:23900,II:28600,III:28600,IV:28600,V:66600,VI:83800,VII:96300}},
{c:"PE079",n:"LA TEBAIDA",d:"CUNDINAMARCA",t:{I:18500,II:22100,III:22100,IV:25400,V:56700,VI:69400,VII:73300}},
{c:"PE080",n:"LA URIBE",d:"VALLE DEL CAUCA",t:{I:13400,II:17400,III:41000,IV:0,V:0,VI:56000,VII:61800}},
{c:"PE081",n:"LAS FLORES",d:"SUCRE",t:{I:6400,II:16400,III:25400,IV:0,V:0,VI:32200,VII:36800}},
{c:"PE082",n:"LAUREANO GOMEZ",d:"MAGDALENA",t:{I:17300,II:20500,III:48400,IV:0,V:0,VI:64500,VII:72700}},
{c:"PE083",n:"LEBRIJA",d:"SANTANDER",t:{I:11500,II:13000,III:31100,IV:0,V:0,VI:40900,VII:47000}},
{c:"PE084",n:"LOBOGUERRERO",d:"VALLE DEL CAUCA",t:{I:12400,II:13800,III:33100,IV:0,V:0,VI:43300,VII:49100}},
{c:"PE085",n:"LOS ACACIOS",d:"NORTE DE SANTANDER",t:{I:9500,II:13300,III:13300,IV:13300,V:29700,VI:38400,VII:43700}},
{c:"PE086",n:"LOS CAUCHOS",d:"HUILA",t:{I:12600,II:13700,III:29200,IV:0,V:0,VI:37100,VII:41800}},
{c:"PE087",n:"LOS CUROS",d:"SANTANDER",t:{I:12700,II:13600,III:35200,IV:0,V:0,VI:43600,VII:51100}},
{c:"PE088",n:"LOS GARZONES 1",d:"CORDOBA",t:{I:6400,II:16400,III:25400,IV:0,V:0,VI:32200,VII:36800}},
{c:"PE089",n:"LOS GARZONES 2",d:"CORDOBA",t:{I:6400,II:16400,III:25400,IV:0,V:0,VI:32200,VII:36800}},
{c:"PE090",n:"LOS LLANOS",d:"ANTIOQUIA",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:37900,VII:42900}},
{c:"PE091",n:"LOS MANGUITOS",d:"CORDOBA",t:{I:19700,II:29100,III:29100,IV:29100,V:52500,VI:52500,VII:96000}},
{c:"PE092",n:"LOS PATIOS",d:"BOGOTA DC",t:{I:13900,II:21700,III:33500,IV:49000,V:0,VI:67100,VII:67500}},
{c:"PE093",n:"LOS SANTOS",d:"SANTANDER",t:{I:17200,II:17800,III:37400,IV:0,V:0,VI:37400,VII:66600}},
{c:"PE094",n:"MACHETÁ",d:"CUNDINAMARCA",t:{I:20400,II:24800,III:21200,IV:24500,V:42500,VI:76800,VII:89000}},
{c:"PE095",n:"MARAHUACO",d:"BOLÍVAR",t:{I:22200,II:33300,III:24400,IV:42200,V:131700,VI:159000,VII:195200}},
{c:"PE096",n:"MATA DE CAÑA",d:"CORDOBA",t:{I:19400,II:28500,III:28500,IV:28500,V:30300,VI:44300,VII:44400}},
{c:"PE097",n:"MEDIACANOA",d:"VALLE DEL CAUCA",t:{I:13200,II:16100,III:42600,IV:0,V:0,VI:55500,VII:64000}},
{c:"PE098",n:"MONDOÑEDO",d:"CUNDINAMARCA",t:{I:18500,II:22100,III:22100,IV:25400,V:73300,VI:100800,VII:115200}},
{c:"PE099",n:"MORRISON",d:"CESAR",t:{I:14800,II:16100,III:32900,IV:0,V:0,VI:42000,VII:47600}},
{c:"PE100",n:"NARANJAL",d:"CUNDINAMARCA",t:{I:17800,II:46100,III:34800,IV:68300,V:79400,VI:91500,VII:101600}},
{c:"PE101",n:"NEGUANJE",d:"MAGDALENA",t:{I:14800,II:22900,III:18400,IV:29100,V:42500,VI:68300,VII:86200}},
{c:"PE102",n:"NEIVA",d:"HUILA",t:{I:17100,II:21200,III:26100,IV:33100,V:50500,VI:63300,VII:73300}},
{c:"PE103",n:"OCOA",d:"META",t:{I:15800,II:30500,III:23100,IV:39900,V:59000,VI:77900,VII:84700}},
{c:"PE104",n:"OIBA",d:"SANTANDER",t:{I:12700,II:13600,III:35200,IV:0,V:0,VI:43600,VII:51100}},
{c:"PE105",n:"PAILITAS",d:"CESAR",t:{I:14800,II:16100,III:32900,IV:0,V:0,VI:42000,VII:47600}},
{c:"PE106",n:"PAJARITO",d:"ANTIOQUIA",t:{I:12900,II:14700,III:17700,IV:22100,V:32000,VI:40500,VII:46700}},
{c:"PE107",n:"PAMPLONITA",d:"NORTE DE SANTANDER",t:{I:21800,II:27100,III:32200,IV:45800,V:64700,VI:81500,VII:94400}},
{c:"PE108",n:"PANDEQUESO",d:"ANTIOQUIA",t:{I:17700,II:19700,III:19700,IV:19700,V:41000,VI:55500,VII:60300}},
{c:"PE109",n:"PAPIROS",d:"ATLÁNTICO",t:{I:0,II:0,III:1100,IV:19500,V:60900,VI:81500,VII:90500}},
{c:"PE110",n:"PARAGUACHÓN",d:"LA GUAJIRA",t:{I:14800,II:22900,III:18400,IV:29100,V:42500,VI:68300,VII:86200}},
{c:"PE111",n:"PASACABALLOS",d:"BOLÍVAR",t:{I:12800,II:13700,III:29300,IV:37900,V:44100,VI:44100,VII:44100}},
{c:"PE112",n:"PASO LA TORRE",d:"VALLE DEL CAUCA",t:{I:13200,II:16100,III:42600,IV:0,V:0,VI:55500,VII:64400}},
{c:"PE113",n:"PAVAS",d:"CALDAS",t:{I:16200,II:19300,III:19300,IV:19300,V:47100,VI:58900,VII:68100}},
{c:"PE114",n:"PIPIRAL",d:"META",t:{I:29100,II:57000,III:39100,IV:68300,V:74300,VI:113800,VII:147000}},
{c:"PE115",n:"PLATANAL",d:"CESAR",t:{I:12400,II:13700,III:28800,IV:0,V:0,VI:36600,VII:41800}},
{c:"PE116",n:"PRIMAVERA",d:"ANTIOQUIA",t:{I:12600,II:13700,III:29200,IV:0,V:0,VI:37100,VII:41800}},
{c:"PE117",n:"PUBENZA",d:"CUNDINAMARCA",t:{I:14000,II:15700,III:17900,IV:23700,V:34400,VI:46100,VII:52700}},
{c:"PE118",n:"PUENTE AMARILLO",d:"META",t:{I:5800,II:19200,III:12300,IV:19200,V:27200,VI:36300,VII:41100}},
{c:"PE119",n:"PUENTE PLATO",d:"MAGDALENA",t:{I:14100,II:17500,III:36800,IV:0,V:0,VI:52200,VII:55700}},
{c:"PE120",n:"PUERTO BERRÍO",d:"ANTIOQUIA",t:{I:15000,II:17500,III:17500,IV:17500,V:38700,VI:48700,VII:55600}},
{c:"PE121",n:"PUERTO COLOMBIA",d:"ATLÁNTICO",t:{I:20700,II:31200,III:22700,IV:39600,V:123200,VI:164000,VII:182200}},
{c:"PE122",n:"PUERTO TRIUNFO",d:"ANTIOQUIA",t:{I:18800,II:29300,III:25600,IV:31800,V:63700,VI:90600,VII:90600}},
{c:"PE123",n:"PURGATORIO",d:"CORDOBA",t:{I:19700,II:29100,III:29100,IV:29100,V:52500,VI:52500,VII:96000}},
{c:"PE124",n:"RAMAL",d:"CUNDINAMARCA",t:{I:18500,II:22100,III:22100,IV:25400,V:73300,VI:100800,VII:115200}},
{c:"PE125",n:"RINCON HONDO",d:"CESAR",t:{I:14700,II:15600,III:16800,IV:17800,V:19100,VI:54500,VII:62500}},
{c:"PE126",n:"RIO BLANCO",d:"SANTANDER",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:37900,VII:42900}},
{c:"PE127",n:"RIO BOGOTA",d:"CUNDINAMARCA",t:{I:12400,II:18500,III:16200,IV:21300,V:36200,VI:48800,VII:52800}},
{c:"PE128",n:"RIO FRIO",d:"VALLE DEL CAUCA",t:{I:12800,II:13700,III:29300,IV:0,V:0,VI:37200,VII:41800}},
{c:"PE129",n:"RIONEGRO",d:"SANTANDER",t:{I:11500,II:13000,III:31100,IV:0,V:0,VI:40900,VII:47000}},
{c:"PE130",n:"ROZO",d:"VALLE DEL CAUCA",t:{I:13200,II:16100,III:42600,IV:0,V:0,VI:55500,VII:64000}},
{c:"PE131",n:"SABANAGRANDE",d:"ATLÁNTICO",t:{I:13300,II:14400,III:31500,IV:0,V:0,VI:41200,VII:47500}},
{c:"PE132",n:"SABOYA",d:"BOYACA",t:{I:12700,II:13600,III:35200,IV:0,V:0,VI:43600,VII:51100}},
{c:"PE133",n:"SACHIA",d:"BOYACA",t:{I:12800,II:13700,III:29300,IV:0,V:0,VI:37200,VII:41800}},
{c:"PE134",n:"SAN BERNARDO",d:"CALDAS",t:{I:16200,II:19300,III:19300,IV:19300,V:47100,VI:58900,VII:68100}},
{c:"PE135",n:"SAN CARLOS",d:"CORDOBA",t:{I:19400,II:28500,III:28500,IV:28500,V:30300,VI:44300,VII:44400}},
{c:"PE136",n:"SAN CLEMENTE",d:"CALDAS",t:{I:12800,II:13700,III:29300,IV:0,V:0,VI:37200,VII:41800}},
{c:"PE137",n:"SAN DIEGO",d:"CESAR",t:{I:7400,II:8000,III:8600,IV:9200,V:19000,VI:54500,VII:61900}},
{c:"PE138",n:"SAN JUAN",d:"LA GUAJIRA",t:{I:13000,II:14700,III:30000,IV:0,V:43000,VI:38000,VII:43000}},
{c:"PE139",n:"SAN ONOFRE",d:"SUCRE",t:{I:19700,II:29100,III:29100,IV:29100,V:52500,VI:83400,VII:96000}},
{c:"PE140",n:"SAN PEDRO",d:"CASANARE",t:{I:20300,II:24900,III:32400,IV:40900,V:62700,VI:78400,VII:90900}},
{c:"PE141",n:"SANTA ISABEL",d:"ANTIOQUIA",t:{I:17500,II:21800,III:21800,IV:21800,V:51700,VI:64800,VII:74700}},
{c:"PE142",n:"SANTAGUEDA",d:"CALDAS",t:{I:16200,II:19300,III:19300,IV:19300,V:47100,VI:58900,VII:68100}},
{c:"PE143",n:"SIBERIA",d:"CUNDINAMARCA",t:{I:15300,II:21800,III:18300,IV:24400,V:42600,VI:57000,VII:62700}},
{c:"PE144",n:"SOPÓ",d:"CUNDINAMARCA",t:{I:13900,II:21700,III:36300,IV:53600,V:0,VI:73000,VII:73800}},
{c:"PE145",n:"SUPIA",d:"ANTIOQUIA",t:{I:17500,II:21800,III:21800,IV:21800,V:51700,VI:64800,VII:74700}},
{c:"PE146",n:"TARAPACÁ I",d:"CALDAS",t:{I:17800,II:23500,III:23500,IV:23500,V:58000,VI:76900,VII:85900}},
{c:"PE147",n:"TARAPACÁ II",d:"CALDAS",t:{I:17800,II:23500,III:23500,IV:23500,V:58000,VI:76900,VII:85900}},
{c:"PE148",n:"TARAZA",d:"ANTIOQUIA",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:37900,VII:42900}},
{c:"PE149",n:"TASAJERA",d:"MAGDALENA",t:{I:17300,II:20500,III:48400,IV:0,V:0,VI:64500,VII:72700}},
{c:"PE150",n:"TORO",d:"VALLE DEL CAUCA",t:{I:12800,II:13700,III:29300,IV:0,V:0,VI:37200,VII:41800}},
{c:"PE151",n:"TRAPICHE",d:"ANTIOQUIA",t:{I:20300,II:22400,III:23800,IV:34500,V:59800,VI:75000,VII:86500}},
{c:"PE152",n:"TUCURINCA",d:"MAGDALENA",t:{I:13100,II:14300,III:33500,IV:0,V:0,VI:43900,VII:50900}},
{c:"PE153",n:"TUNEL LA LINEA QUINDIO",d:"QUINDÍO",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:37900,VII:42900}},
{c:"PE154",n:"TUNEL LA LINEA TOLIMA",d:"TOLIMA",t:{I:13000,II:14600,III:29800,IV:0,V:0,VI:37900,VII:42900}},
{c:"PE155",n:"TURBACO",d:"BOLÍVAR",t:{I:5800,II:12900,III:15900,IV:15900,V:15900,VI:15900,VII:15900}},
{c:"PE156",n:"TUTA",d:"BOYACA",t:{I:12400,II:13700,III:35400,IV:0,V:0,VI:43700,VII:51400}},
{c:"PE157",n:"UNISABANA",d:"CUNDINAMARCA",t:{I:0,II:0,III:0,IV:0,V:54500,VI:68900,VII:75900}},
{c:"PE158",n:"URIBIA",d:"LA GUAJIRA",t:{I:14800,II:22900,III:18400,IV:29100,V:42500,VI:68300,VII:86200}},
{c:"PE159",n:"VALENCIA",d:"CESAR",t:{I:12500,II:13700,III:29700,IV:0,V:0,VI:38400,VII:43700}},
{c:"PE160",n:"VENGACHI",d:"ANTIOQUIA",t:{I:17500,II:21800,III:21800,IV:21800,V:51700,VI:64800,VII:74700}},
{c:"PE161",n:"VERACRUZ",d:"META",t:{I:10400,II:20700,III:13300,IV:20700,V:29600,VI:39800,VII:44600}},
{c:"PE162",n:"VILLA RICA",d:"CAUCA",t:{I:13200,II:16100,III:42600,IV:0,V:0,VI:55500,VII:64000}},
{c:"PE163",n:"YUCAO",d:"META",t:{I:8300,II:8800,III:9900,IV:9900,V:36700,VI:45300,VII:51200}},
{c:"PE164",n:"ZAMBITO",d:"SANTANDER",t:{I:16300,II:20500,III:47600,IV:0,V:0,VI:57100,VII:67200}},
{c:"PE165",n:"ZARAGOZA",d:"ANTIOQUIA",t:{I:17600,II:21800,III:21800,IV:21800,V:51600,VI:64700,VII:74600}},
];

function Calculadora({ vehiculos, viajes, rutas = [], onGuardar, onGuardarRuta, onEliminarRuta }) {
  const navigate = useNavigate();

  const [fecha,       setFecha]       = useState(new Date().toISOString().slice(0,10));
  const [mani,        setMani]        = useState("");
  const [placa,       setPlaca]       = useState("");
  const [tipoCarga,   setTipoCarga]   = useState("");
  const [producto,    setProducto]    = useState("");
  const [ruta,        setRuta]        = useState("");
  const [empresa,     setEmpresa]     = useState("");
  const [conductor,   setConductor]   = useState("");
  const [kmCargado,   setKmCargado]   = useState("");
  const [kmVacio,     setKmVacio]     = useState("");
  const [tonelaje,    setTonelaje]    = useState("");
  const [fleteTon,    setFleteTon]    = useState("");
  const [modoComb,    setModoComb]    = useState("auto");
  const [rendCargado, setRendCargado] = useState("");
  const [rendVacio,   setRendVacio]   = useState("");
  const [galManual,   setGalManual]   = useState("");
  const [precioAcpm,  setPrecioAcpm]  = useState(() => localStorage.getItem("ultimo_acpm") || "");
  const [precioAdblue,setPrecioAdblue]= useState(() => localStorage.getItem("ultimo_adblue") ||"");
  const [categoria,   setCategoria]   = useState("VII");
  const [busquedaP,   setBusquedaP]   = useState("");
  const [selP,        setSelP]        = useState("");
  const [peajesRuta,  setPeajesRuta]  = useState([]);
  const [porcCond,    setPorcCond]    = useState("");
  const [carpado,     setCarpado]     = useState("");
  const [gastosViaje, setGastosViaje] = useState("");
  const [extras,      setExtras]      = useState([]);
  const [nuevoNom,    setNuevoNom]    = useState("");
  const [nuevoVal,    setNuevoVal]    = useState("");
  const [guardando,   setGuardando]   = useState(false);
  const [modoFlete, setModoFlete] = useState("porTon");
  const [modoConductor, setModoConductor] = useState("porcentaje");
  const [descRetefuente,    setDescRetefuente]    = useState(false);
  const [pctRetefuente,     setPctRetefuente]     = useState(1);
  const [descReteica,       setDescReteica]       = useState(false);
  const [pctReteica,        setPctReteica]        = useState(0.414);
  const [descFopat,         setDescFopat]         = useState(false);
  const [pctFopat,          setPctFopat]          = useState(2);
  const [descOtro,          setDescOtro]          = useState(false);
  const [pctOtro,           setPctOtro]           = useState(0);
  const [nombreOtro,        setNombreOtro]        = useState("");
  const [contactoEmpresa,   setContactoEmpresa]   = useState("");
  const [celularEmpresa,    setCelularEmpresa]    = useState("");
  const [tieneRetorno,     setTieneRetorno]       = useState(false);
  const [fleteRetorno,     setFleteRetorno]       = useState("");
  const [tonelajeRetorno,  setTonelajeRetorno]    = useState("");
  const [modoFleteRetorno, setModoFleteRetorno]   = useState("porTon");
  const [mostrarRutas,   setMostrarRutas]   = useState(false);
  const [guardandoRuta,  setGuardandoRuta]  = useState(false);
  const [nombreRuta,     setNombreRuta]     = useState("");
  const [mostrarGuardar, setMostrarGuardar] = useState(false);


  const n   = (v) => parseFloat(v) || 0;
  const fmt = (v) => "$" + Math.round(v).toLocaleString("es-CO");
  const fnD = (v, d) => (Math.round(v * Math.pow(10,d)) / Math.pow(10,d))
    .toLocaleString("es-CO", { maximumFractionDigits: d });
  const conductoresFrecuentes = [...new Set(
    viajes
    .map(v => v.condNom)
    .filter(c => c && c.trim() !=="")
  )]
  const valorViajeIda = modoFlete === "porTon"
    ?n(tonelaje) * n(fleteTon)
    : n(fleteTon);

  const valorViajeRetorno = tieneRetorno
    ?modoFleteRetorno === "porTon"
      ? n(tonelajeRetorno) * n(fleteRetorno)
      : n(fleteRetorno)
    : 0;

  const valorViaje = valorViajeIda + valorViajeRetorno;

  const kmTotal    = n(kmCargado) + n(kmVacio);

  let galCarg = 0, galVac = 0, galTotal = 0;
  if (modoComb === "auto") {
    galCarg  = n(rendCargado) > 0 ? n(kmCargado) / n(rendCargado) : 0;
    galVac   = n(rendVacio)   > 0 ? n(kmVacio)   / n(rendVacio)   : 0;
    galTotal = galCarg + galVac;
  } else {
    galTotal = n(galManual);
  }

  const adblLt    = galTotal * ADBLUE_RATIO;
  const costoAcpm = galTotal * n(precioAcpm);
  const costoAdbl = adblLt   * n(precioAdblue);
  const costoComb = costoAcpm + costoAdbl;
  const totPeajes = peajesRuta.reduce((s,p) => s + (p.t[categoria]||0) * (p.iv?2:1), 0);
  const costoConduct = modoConductor === "porcentaje" ? (n(porcCond)/100) * valorViaje : n(porcCond);
  const totExtras = extras.reduce((s,e) => s + e.valor, 0);
  const valRetefuente = descRetefuente ? (pctRetefuente/100) * valorViaje : 0;
  const valReteica    = descReteica    ? (pctReteica/100)    * valorViaje : 0;
  const valFopat      = descFopat      ? (pctFopat/100)      * valorViaje : 0;
  const valOtro       = descOtro       ? (pctOtro/100)       * valorViaje : 0;
  const totalDesc     = valRetefuente + valReteica + valFopat + valOtro;
  const totalGastos = costoComb + totPeajes + costoConduct + n(carpado) + n(gastosViaje) + totExtras + totalDesc;
  const gananciaNeta = valorViaje - totalGastos;
  const margen = valorViaje > 0 ? (gananciaNeta / valorViaje) * 100 : 0;
  const cxkm   = kmTotal > 0 ? totalGastos / kmTotal : 0;
  const margenColor = margen >= 40 ? t.colors.green : margen >= 20 ? t.colors.amber : t.colors.red;


  const peajesFiltrados = busquedaP
    ? PEAJES.filter(p =>
        p.n.toLowerCase().includes(busquedaP.toLowerCase()) ||
        p.d.toLowerCase().includes(busquedaP.toLowerCase()))
    : PEAJES;

  const agregarPeaje = () => {
    if (!selP) return;
    const p = PEAJES.find(x => x.c === selP);
    if (!p || peajesRuta.find(x => x.c === p.c)) return;
    setPeajesRuta([...peajesRuta, { ...p, iv: false }]);
    setSelP("");
  };

  const toggleIV  = (c) => setPeajesRuta(peajesRuta.map(p => p.c===c ? {...p,iv:!p.iv} : p));
  const quitarP   = (c) => setPeajesRuta(peajesRuta.filter(p => p.c!==c));

  const agregarExtra = () => {
    if (!nuevoNom.trim()) return;
    setExtras([...extras, { n: nuevoNom.trim(), valor: n(nuevoVal) }]);
    setNuevoNom(""); setNuevoVal("");
  };

  const guardarViaje = async () => {
    if (!ruta.trim())  { alert("Ingresa la ruta del viaje"); return; }
    if (!valorViaje)   { alert("Ingresa tonelaje y flete"); return; }
    setGuardando(true);
    await onGuardar({
      fecha, mani, placa, tipoCarga, producto,
      ruta: ruta.trim(), emp: empresa, condNom: conductor, contactoEmpresa, celularEmpresa,
      kmCargado: n(kmCargado), kmVacio: n(kmVacio), kmT: kmTotal,
      ton: n(tonelaje), fleteTon: n(fleteTon), vViaje: valorViaje,
      tieneRetorno, valorViajeIda, valorViajeRetorno, tonelajeRetorno: n(), fleteRetorno: n(fleteRetorno),
      gTot: galTotal, galCargado: galCarg, galVacio: galVac,
      adlt: adblLt, cAcpm: costoAcpm, cAdbl: costoAdbl, cComb: costoComb,
      peajes: totPeajes,
      peajesDetalle: peajesRuta.map(p => ({
        n: p.n, d: p.d, tarifa: p.t[categoria]||0, iv: p.iv,
        total: (p.t[categoria]||0) * (p.iv?2:1),
      })),
      pcond: n(porcCond), conductor: costoConduct,
      carp: n(carpado), gv2: n(gastosViaje),
      extras: totExtras, extrasList: extras,
      total: totalGastos, neta: gananciaNeta,
      mrg: margen, margen, cxk: cxkm,
      descuentos: { 
        retefuente: valRetefuente,
        reteica: valReteica,
        fopat: valFopat,
        otro: valOtro,
        nombreOtro: nombreOtro,
        total: totalDesc,
      }
    });
    alert("✅ Viaje guardado");
    navigate(-1);
  };

  const cargarRuta = (rutaGuardada) => {
  setRuta(rutaGuardada.ruta);
  setKmCargado(rutaGuardada.kmCargado || "");
  setKmVacio(rutaGuardada.kmVacio || "");
  setRendCargado(rutaGuardada.rendCargado || "");
  setRendVacio(rutaGuardada.rendVacio || "");
  setPeajesRuta(rutaGuardada.peajesRuta || []);
  setCategoria(rutaGuardada.categoria || "VII");
  setMostrarRutas(false);
};

const guardarRutaFrecuente = async () => {
  if (!ruta.trim()) { alert("Ingresa el nombre de la ruta primero"); return; }
  setGuardandoRuta(true);
  await onGuardarRuta({
    nombre: nombreRuta.trim() || ruta.trim(),
    ruta: ruta.trim(),
    kmCargado: n(kmCargado),
    kmVacio:   n(kmVacio),
    rendCargado: n(rendCargado),
    rendVacio:   n(rendVacio),
    peajesRuta: peajesRuta.map(p => ({
      c: p.c,
      n: p.n,
      d: p.d,
      t: p.t,
      iv: p.iv,
    })),
    categoria,
  });
  setGuardandoRuta(false);
  setMostrarGuardar(false);
  setNombreRuta("");
  alert("✅ Ruta guardada");
};

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Calculadora</h1>
      </div>

      {/* ── RUTAS FRECUENTES ── */}
{rutas.length > 0 && (
  <div style={{padding:"10px 16px 0"}}>
    <button
      style={{
        width:"100%", padding:"11px", background:t.colors.blueSoft,
        border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md,
        fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold,
        color:t.colors.blue, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"
      }}
      onClick={()=>setMostrarRutas(!mostrarRutas)}
    >
      📍 {mostrarRutas ? "Cerrar rutas" : `Cargar ruta guardada (${rutas.length})`}
    </button>

    {mostrarRutas && (
      <div style={{background:t.colors.bgCard, borderRadius:t.radius.lg, marginTop:"8px", overflow:"hidden", boxShadow:t.shadows.card}}>
        {rutas.map((r,i,arr)=>(
          <div key={r.firestoreId} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"12px 16px",
            borderBottom: i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`
          }}>
            <div>
              <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>
                {r.nombre}
              </p>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0"}}>
                {r.kmCargado>0?`${r.kmCargado} km cargado`:""}{r.kmVacio>0?` · ${r.kmVacio} km vacío`:""} · {r.peajesRuta?.length||0} peajes
              </p>
            </div>
            <div style={{display:"flex", gap:"8px"}}>
              <button
                style={{padding:"6px 12px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, cursor:"pointer"}}
                onClick={()=>cargarRuta(r)}
              >
                Cargar
              </button>
              <button
                style={{padding:"6px 10px", background:t.colors.redSoft, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, cursor:"pointer"}}
                onClick={()=>onEliminarRuta(r.firestoreId)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {/* ── DATOS DEL VIAJE ── */}
      <div style={styles.seccionLabel}>Datos del viaje</div>
      <div style={styles.card}>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha</label>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Manifiesto</label>
            <input type="text" placeholder="123456789" value={mani} onChange={e=>setMani(e.target.value)} style={styles.input} />
          </div>
        </div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Placa vehículo</label>
            <select value={placa} onChange={e=>setPlaca(e.target.value)}
              style={{...styles.input, color: placa ? t.colors.textPrimary : t.colors.textTertiary}}>
              <option value="">Sin asignar</option>
              {vehiculos.map(v=>(
                <option key={v.firestoreId} value={v.placa}>{v.placa} — {v.tipoVehiculo}</option>
              ))}
            </select>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de carga</label>
            <input type="text" placeholder="Granel" value={tipoCarga} onChange={e=>setTipoCarga(e.target.value)} style={styles.input} />
          </div>
        </div>
        <div style={styles.campo}>
          <label style={styles.label}>Ruta (Origen → Destino)</label>
          <input type="text" placeholder="Barranquilla – Bogotá" value={ruta} onChange={e=>setRuta(e.target.value)} style={styles.input} />
        </div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Producto</label>
            <input type="text" placeholder="Maíz" value={producto} onChange={e=>setProducto(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Empresa</label>
            <input type="text" placeholder="TransABC" value={empresa} onChange={e=>setEmpresa(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
          <label style={styles.label}>Contacto empresa</label>
          <input type="text" placeholder="Nombre del contacto" value={contactoEmpresa} onChange={e=>setContactoEmpresa(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
          <label style={styles.label}>Celular contacto</label>
          <input type="tel" placeholder="+57 300 000 0000" value={celularEmpresa} onChange={e=>setCelularEmpresa(e.target.value)} style={styles.input} />
          </div>
        </div>
        <div style={styles.campo}>
  <label style={styles.label}>Conductor</label>
  {conductoresFrecuentes.length > 0 && (
    <select
      value={conductoresFrecuentes.includes(conductor) ? conductor : "__nuevo__"}
      onChange={e => {
        if (e.target.value === "__nuevo__") {
          setConductor("");
        } else {
          setConductor(e.target.value);
        }
      }}
      style={{...styles.input, marginBottom:"6px", color: t.colors.textPrimary}}
    >
      <option value="__nuevo__">+ Escribir nuevo conductor</option>
      {conductoresFrecuentes.map((c,i) => (
        <option key={i} value={c}>{c}</option>
      ))}
    </select>
  )}
  {(!conductoresFrecuentes.includes(conductor) || conductoresFrecuentes.length === 0) && (
    <input
      type="text"
      placeholder="Nombre del conductor"
      value={conductor}
      onChange={e => setConductor(e.target.value)}
      style={styles.input}
    />
  )}

  {/* GUARDAR RUTA */}
<div style={{marginTop:"10px", borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"10px"}}>
  {!mostrarGuardar ? (
    <button
      style={{
        width:"100%", padding:"9px", background:"none",
        border:`1.5px dashed ${t.colors.blueBorder}`,
        borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm,
        color:t.colors.blue, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
        fontWeight:t.fonts.weightSemibold
      }}
      onClick={()=>setMostrarGuardar(true)}
    >
      + Guardar como ruta frecuente
    </button>
  ) : (
    <div>
      <div style={styles.campo}>
        <label style={styles.label}>Nombre de la ruta</label>
        <input
          type="text"
          placeholder="Ej: Barranquilla - Bogotá"
          value={nombreRuta}
          onChange={e=>setNombreRuta(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={{display:"flex", gap:"8px"}}>
        <button
          style={{flex:1, padding:"10px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", opacity:guardandoRuta?0.75:1}}
          onClick={guardarRutaFrecuente}
          disabled={guardandoRuta}
        >
          {guardandoRuta?"Guardando...":"Guardar ruta"}
        </button>
        <button
          style={{padding:"10px 14px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, cursor:"pointer"}}
          onClick={()=>{setMostrarGuardar(false);setNombreRuta("");}}
        >
          Cancelar
        </button>
      </div>
    </div>
  )}
</div>

</div>
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Km cargado</label>
            <input type="number" placeholder="300" value={kmCargado} onChange={e=>setKmCargado(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Km vacío</label>
            <input type="number" placeholder="100" value={kmVacio} onChange={e=>setKmVacio(e.target.value)} style={styles.input} />
          </div>
        </div>
        {/* MODO DE FLETE */}
<div style={styles.campo}>
  <label style={styles.label}>Modo de pago del flete</label>
  <select
    value={modoFlete}
    onChange={e => setModoFlete(e.target.value)}
    style={styles.input}
  >
    <option value="porTon">Por tonelada ($/ton)</option>
    <option value="porViaje">Por viaje (valor fijo)</option>
  </select>
</div>

<div style={styles.fila2}>
  <div style={styles.campo}>
    <label style={styles.label}>Toneladas</label>
    <input
      type="number"
      placeholder="33.5"
      step="0.01"
      value={tonelaje}
      onChange={e => setTonelaje(e.target.value)}
      style={styles.input}
    />
  </div>
  {modoFlete === "porTon" ? (
    <div style={styles.campo}>
      <label style={styles.label}>Flete ($/ton)</label>
      <input
        type="number"
        placeholder="80000"
        value={fleteTon}
        onChange={e => setFleteTon(e.target.value)}
        style={styles.input}
      />
    </div>
  ) : (
    <div style={styles.campo}>
      <label style={styles.label}>Valor del viaje ($)</label>
      <input
        type="number"
        placeholder="2500000"
        value={fleteTon}
        onChange={e => setFleteTon(e.target.value)}
        style={styles.input}
      />
    </div>
  )}
    </div>

        {/* VALOR VIAJE */}
        {valorViaje > 0 && (
          <div style={styles.valorViajeBox}>
            <span style={styles.valorViajeLabel}>
              {modoFlete === "porTon"
                ? fnD(n(tonelaje),2) + " ton x $" + Math.round(n(fleteTon)).toLocaleString("es-CO") + "/ton"
                : "Valor fijo por viaje"}
            </span>
            <span style={styles.valorViajeNum}>{fmt(valorViaje)}</span>
          </div>
        )}
      </div>
        
        {/* RETORNO */}
      <div style={{marginTop:"10px"}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
      <input
        type="checkbox"
        checked={tieneRetorno}
        onChange={e=>setTieneRetorno(e.target.checked)}
        style={{width:"18px",height:"18px",cursor:"pointer",accentColor:t.colors.blue}}
      />
        <label style={{...styles.label, textTransform:"none", letterSpacing:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightMedium}}>
        ¿Regresa con carga? (flete de retorno)
        </label>
      </div>

        {tieneRetorno && (
        <div style={{marginTop:"12px", padding:"12px", background:t.colors.bgSection, borderRadius:t.radius.md}}>
        <div style={styles.campo}>
        <label style={styles.label}>Modo de pago retorno</label>
        <select
          value={modoFleteRetorno}
          onChange={e=>setModoFleteRetorno(e.target.value)}
          style={styles.input}
        >
          <option value="porTon">Por tonelada ($/ton)</option>
          <option value="porViaje">Por viaje (valor fijo)</option>
          </select>
        </div>
          <div style={styles.fila2}>
          <div style={styles.campo}>
          <label style={styles.label}>Toneladas retorno</label>
          <input type="number" placeholder="30" step="0.01" value={tonelajeRetorno}
            onChange={e=>setTonelajeRetorno(e.target.value)} style={styles.input} />
        </div>
        {modoFleteRetorno === "porTon" ? (
          <div style={styles.campo}>
            <label style={styles.label}>Flete retorno ($/ton)</label>
            <input type="number" placeholder="60000" value={fleteRetorno}
              onChange={e=>setFleteRetorno(e.target.value)} style={styles.input} />
          </div>
        ) : (
          <div style={styles.campo}>
            <label style={styles.label}>Valor retorno ($)</label>
            <input type="number" placeholder="1500000" value={fleteRetorno}
              onChange={e=>setFleteRetorno(e.target.value)} style={styles.input} />
          </div>
        )}
      </div>
      {valorViajeRetorno > 0 && (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:`1px solid ${t.colors.border}`}}>
          <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>Flete retorno</span>
          <span style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.blue}}>{fmt(valorViajeRetorno)}</span>
        </div>
      )}
    </div>
  )}
</div>

      {/* ── COMBUSTIBLE ── */}
      <div style={styles.seccionLabel}>Combustible / Adblue</div>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label style={styles.label}>Modo de cálculo</label>
          <select value={modoComb} onChange={e=>setModoComb(e.target.value)} style={styles.input}>
            <option value="auto">Rendimiento (Km/Gal)</option>
            <option value="manual">Consumo total (Gal/viaje)</option>
          </select>
        </div>
        {modoComb === "auto" ? (
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label style={styles.label}>Cargado (Km/Gal)</label>
              <input type="number" placeholder="7" step="0.1" value={rendCargado} onChange={e=>setRendCargado(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Vacío (Km/Gal)</label>
              <input type="number" placeholder="11" step="0.1" value={rendVacio} onChange={e=>setRendVacio(e.target.value)} style={styles.input} />
            </div>
          </div>
        ) : (
          <div style={styles.campo}>
            <label style={styles.label}>Total galones</label>
            <input type="number" placeholder="120" value={galManual} onChange={e=>setGalManual(e.target.value)} style={styles.input} />
          </div>
        )}
        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Precio ACPM ($/gal)</label>
            <input type="number" placeholder="10500" value={precioAcpm} onChange={e=>setPrecioAcpm(e.target.value)} onBlur= {e=> localStorage.setItem("ultimo_acpm", e.target.value)}  style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Precio Adblue ($/lt)</label>
            <input type="number" placeholder="3500" value={precioAdblue} onChange={e=>setPrecioAdblue(e.target.value)} onBlur= {e=> localStorage.setItem("ultimo_adblue", e.target.value)}  style={styles.input} />
          </div>
        </div>
        {galTotal > 0 && (
          <div style={styles.resumenBox}>
            {modoComb === "auto" && <>
              <div style={styles.resumenFila}><span style={styles.resumenL}>Galones cargado</span><span style={styles.resumenV}>{fnD(galCarg,2)} gal</span></div>
              <div style={styles.resumenFila}><span style={styles.resumenL}>Galones vacío</span><span style={styles.resumenV}>{fnD(galVac,2)} gal</span></div>
            </>}
            <div style={styles.resumenFila}><span style={styles.resumenL}>Total ACPM</span><span style={styles.resumenV}>{fnD(galTotal,2)} gal</span></div>
            <div style={styles.resumenFila}><span style={styles.resumenL}>Adblue (18.9%)</span><span style={styles.resumenV}>{fnD(adblLt,2)} lt</span></div>
            <div style={{...styles.resumenFila, borderBottom:"none", paddingTop:"8px"}}>
              <span style={{...styles.resumenL, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary}}>Combustible + Adblue</span>
              <span style={{...styles.resumenV, color: t.colors.red, fontWeight: t.fonts.weightBold}}>{fmt(costoComb)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── PEAJES ── */}
      <div style={styles.seccionLabel}>Peajes de ruta</div>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label style={styles.label}>Categoría del vehículo</label>
          <select value={categoria} onChange={e=>setCategoria(e.target.value)} style={styles.input}>
            <option value="I">Automoviles, Camperos, Camionetas (Cat I)</option>
            <option value="II">Buses y Busetas (Cat II)</option>
            <option value="III">Camiones 2 ejes pequeño(Cat III)</option>
            <option value="IV">Camión 2 ejes grandes (Cat IV)</option>
            <option value="V">Camiones 3-4 ejes (Cat V)</option>
            <option value="VI">Camiones 5 ejes (Cat VI)</option>
            <option value="VII">Camiones 6 ejes (Cat VII)</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Buscar peaje por nombre o departamento..."
          value={busquedaP}
          onChange={e=>setBusquedaP(e.target.value)}
          style={{...styles.input, marginBottom:"8px"}}
        />
        <div style={styles.filaAgregar}>
          <select value={selP} onChange={e=>setSelP(e.target.value)}
            style={{...styles.input, flex:1, marginBottom:0}}>
            <option value="">— Seleccionar peaje —</option>
            {peajesFiltrados.map(p=>(
              <option key={p.c} value={p.c}>
                {p.n} ({p.d}) — ${(p.t[categoria]||0).toLocaleString("es-CO")}
              </option>
            ))}
          </select>
          <button style={styles.btnAgregarP} onClick={agregarPeaje}>
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        {peajesRuta.length > 0 && (
          <div style={styles.peajesTags}>
            {peajesRuta.map(p=>{
              const tarifa = p.t[categoria]||0;
              const total  = tarifa*(p.iv?2:1);
              return (
                <div key={p.c} style={styles.peajeTag}>
                  <span style={styles.peajeTagNom}>{p.n} — {fmt(total)}</span>
                  <button
                    style={{...styles.peajeTagBtn, background: p.iv ? t.colors.greenSoft : t.colors.blueSoft, color: p.iv ? t.colors.green : t.colors.blue}}
                    onClick={()=>toggleIV(p.c)}
                  >
                    {p.iv ? "I+V" : "Ida"}
                  </button>
                  <button style={styles.peajeTagDel} onClick={()=>quitarP(p.c)}>
                    <X size={12} color={t.colors.red} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.totalPeajesRow}>
          <span style={styles.totalPeajesL}>Total peajes</span>
          <span style={styles.totalPeajesV}>{fmt(totPeajes)}</span>
        </div>
      </div>

      {/* ── COSTOS ── */}
      <div style={styles.seccionLabel}>Costos del viaje</div>
      <div style={styles.card}>
        <div style={styles.campo}>
  <label style={styles.label}>Modo de pago conductor</label>
  <select
    value={modoConductor}
    onChange={e => {
      console.log("Modo Conductor:", e.target.value);
      console.log("porcCond antes:", porcCond);
      setModoConductor(e.target.value);
      setPorcCond("");
    }}
    style={styles.input}
  >
    <option value="porcentaje">Porcentaje del viaje (%)</option>
    <option value="fijo">Valor fijo ($)</option>
  </select>
</div>

<div style={styles.fila2}>
  <div style={styles.campo}>
    {modoConductor === "porcentaje" ? (
      <>
        <label style={styles.label}>% Conductor</label>
        <input type="number" placeholder="10" value={porcCond}
          onChange={e=>setPorcCond(e.target.value)} style={styles.input} />
      </>
    ) : (
      <>
        <label style={styles.label}>Valor conductor ($)</label>
        <input type="number" placeholder="200000" value={porcCond}
          onChange={e=>setPorcCond(e.target.value)} style={styles.input} />
      </>
    )}
  </div>
  <div style={styles.campo}>
    <label style={styles.label}>Carpado/Descarpado</label>
    <input type="number" placeholder="20000" value={carpado}
      onChange={e=>setCarpado(e.target.value)} style={styles.input} />
  </div>
</div>
        <div style={styles.campo}>
          <label style={styles.label}>Gastos de viaje</label>
          <input type="number" placeholder="30000" value={gastosViaje} onChange={e=>setGastosViaje(e.target.value)} style={styles.input} />
        </div>

        {extras.map((e,i)=>(
          <div key={i} style={styles.extraFila}>
            <span style={{fontSize: t.fonts.sizeSm, color: t.colors.textSecondary}}>{e.n}</span>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <span style={{fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold}}>{fmt(e.valor)}</span>
              <button style={{background:"none",border:"none",cursor:"pointer",padding:"2px"}} onClick={()=>setExtras(extras.filter((_,j)=>j!==i))}>
                <X size={14} color={t.colors.red} />
              </button>
            </div>
          </div>
        ))}

        <div style={styles.fila2}>
          <input type="text" placeholder="Nombre del costo" value={nuevoNom}
            onChange={e=>setNuevoNom(e.target.value)}
            style={{...styles.input, marginBottom:0}} />
          <input type="number" placeholder="Valor" value={nuevoVal}
            onChange={e=>setNuevoVal(e.target.value)}
            style={{...styles.input, marginBottom:0}} />
        </div>
        <button style={styles.btnAgregarExtra} onClick={agregarExtra}>
          <Plus size={14} color={t.colors.blue} strokeWidth={2.5} />
          Agregar costo
        </button>
      </div>

      {/* ── DESCUENTOS DE LEY ── */}
<div style={styles.seccionLabel}>Descuentos de ley</div>
<div style={styles.card}>
  <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 14px"}}>
    Activa los descuentos que aplique la empresa sobre el valor del viaje.
  </p>

  {[
    {
      id:"retefuente", label:"Retención en la fuente", sub:"Sobre valor del viaje",
      activo:descRetefuente, setActivo:setDescRetefuente,
      pct:pctRetefuente,     setPct:setPctRetefuente,
      val:valRetefuente,
    },
    {
      id:"reteica", label:"Reteica", sub:"Varía por municipio",
      activo:descReteica, setActivo:setDescReteica,
      pct:pctReteica,     setPct:setPctReteica,
      val:valReteica,
    },
    {
      id:"fopat", label:"FOPAT", sub:"Fondo de protección al transportador",
      activo:descFopat, setActivo:setDescFopat,
      pct:pctFopat,     setPct:setPctFopat,
      val:valFopat,
    },
  ].map((d,i,arr)=>(
    <div key={d.id} style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"10px 0",
      borderBottom: i===arr.length-1 ? "none" : `1px solid ${t.colors.borderLight}`,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
        <input
          type="checkbox"
          checked={d.activo}
          onChange={e=>d.setActivo(e.target.checked)}
          style={{width:"18px", height:"18px", cursor:"pointer", accentColor:t.colors.blue}}
        />
        <div>
          <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>{d.label}</p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0"}}>{d.sub}</p>
        </div>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
        <input
          type="number" value={d.pct} min="0" max="100" step="0.001"
          onChange={e=>d.setPct(parseFloat(e.target.value)||0)}
          style={{...styles.input, width:"60px", textAlign:"right", marginBottom:0, padding:"6px 8px"}}
        />
        <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>%</span>
        <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.red, minWidth:"80px", textAlign:"right"}}>
          {d.activo && d.val>0 ? fmt(d.val) : "—"}
        </span>
      </div>
    </div>
  ))}

  {/* OTRO */}
  <div style={{borderTop:`1px solid ${t.colors.borderLight}`, paddingTop:"10px", marginTop:"4px"}}>
    <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px"}}>
      <input
        type="checkbox"
        checked={descOtro}
        onChange={e=>setDescOtro(e.target.checked)}
        style={{width:"18px", height:"18px", cursor:"pointer", accentColor:t.colors.blue}}
      />
      <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0}}>Otro descuento</p>
    </div>
    {descOtro && (
      <div style={styles.fila2}>
        <div style={styles.campo}>
          <label style={styles.label}>Nombre</label>
          <input
            type="text" placeholder="Ej: Pronto pago"
            value={nombreOtro} onChange={e=>setNombreOtro(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.campo}>
          <label style={styles.label}>Porcentaje (%)</label>
          <input
            type="number" placeholder="0" value={pctOtro} min="0" max="100" step="0.1"
            onChange={e=>setPctOtro(parseFloat(e.target.value)||0)}
            style={styles.input}
          />
        </div>
      </div>
    )}
    {descOtro && valOtro>0 && (
      <div style={{display:"flex", justifyContent:"space-between", marginTop:"4px"}}>
        <span style={{fontSize:t.fonts.sizeSm, color:t.colors.textSecondary}}>{nombreOtro||"Otro"}</span>
        <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.red}}>{fmt(valOtro)}</span>
      </div>
    )}
  </div>

  {/* TOTAL DESCUENTOS */}
  {totalDesc > 0 && (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${t.colors.border}`, paddingTop:"10px", marginTop:"8px"}}>
      <span style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary}}>Total descuentos</span>
      <span style={{fontSize:t.fonts.sizeLg, fontWeight:t.fonts.weightBold, color:t.colors.red}}>{fmt(totalDesc)}</span>
    </div>
  )}
</div>  

      {/* ── RESULTADO ── */}
      <div style={styles.seccionLabel}>Resultado del viaje</div>
      <div style={styles.card}>
        <div style={styles.fila2}>
          <div style={styles.metCard}>
            <p style={styles.metLabel}>Total viaje</p>
            <p style={{...styles.metVal, color: t.colors.blue}}>{valorViaje>0?fmt(valorViaje):"$—"}</p>
          </div>
          <div style={styles.metCard}>
            <p style={styles.metLabel}>Total gastos</p>
            <p style={{...styles.metVal, color: t.colors.red}}>{totalGastos>0?fmt(totalGastos):"$—"}</p>
          </div>
        </div>

        {/* GANANCIA — protagonista */}
        <div style={{
          ...styles.gananciaResultBox,
          background: gananciaNeta >= 0 ? t.colors.greenSoft : t.colors.redSoft,
          borderColor: gananciaNeta >= 0 ? t.colors.greenBorder : t.colors.redBorder,
        }}>
          <p style={styles.gananciaResultLabel}>Ganancia neta</p>
          <p style={{...styles.gananciaResultVal, color: gananciaNeta>=0?t.colors.green:t.colors.red}}>
            {valorViaje>0?fmt(gananciaNeta):"$—"}
          </p>
        </div>

        {valorViaje > 0 && <>
          {[
            {l:`ACPM (${fnD(galTotal,1)} gal)`,  v: costoAcpm},
            {l:`Adblue (${fnD(adblLt,1)} lt)`,   v: costoAdbl},
            {l:"Peajes",                          v: totPeajes},
            {l: modoConductor === "porcentaje" ?  "Conductor (" + n(porcCond) + "%)" : "Conductor (valor fijo", v: costoConduct},
            {l:"Carpado/Descarpado",              v: n(carpado)},
            {l:"Gastos de viaje",                 v: n(gastosViaje)},
            {l:"Otros gastos",                    v: totExtras},
            {l:"Descuentos de ley",               v: totalDesc},
          ].filter(r=>r.v>0).map(r=>(
            <div key={r.l} style={styles.desgloseFila}>
              <span style={styles.desgloseL}>{r.l}</span>
              <span style={styles.desgloseV}>{fmt(r.v)}</span>
            </div>
          ))}
          <div style={styles.desgloseFila}><span style={styles.desgloseL}>Recorrido total</span><span style={styles.desgloseV}>{kmTotal>0?kmTotal.toLocaleString("es-CO")+" km":"—"}</span></div>
          <div style={styles.desgloseFila}><span style={styles.desgloseL}>Costo/km</span><span style={styles.desgloseV}>{kmTotal>0?fmt(cxkm)+"/km":"—"}</span></div>
          <div style={{...styles.desgloseFila, borderBottom:"none"}}>
            <span style={styles.desgloseL}>Margen neto</span>
            <span style={{...styles.desgloseV, color: margenColor, fontWeight: t.fonts.weightBold}}>{margen.toFixed(1)}%</span>
          </div>
          <div style={styles.barraFondo}>
            <div style={{...styles.barraRelleno, width:`${Math.min(Math.max(margen,0),100)}%`, background: margenColor}} />
          </div>
        </>}

        <button
          style={{...styles.btnGuardar, opacity: guardando?0.75:1}}
          onClick={guardarViaje}
          disabled={guardando}
        >
          <Save size={18} color="#fff" strokeWidth={2} />
          {guardando ? "Guardando..." : "Guardar viaje"}
        </button>
      </div>

    </div>
  );
}

const styles = {
  pantalla:         { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:           { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:        { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:           { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  seccionLabel:     { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"16px 20px 8px" },
  card:             { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", margin:"0 16px 4px", boxShadow:t.shadows.card },
  campo:            { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:            { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:            { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:            { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
  valorViajeBox:    { display:"flex", justifyContent:"space-between", alignItems:"center", background:t.colors.blueSoft, border:`1.5px solid ${t.colors.blueBorder}`, borderRadius:t.radius.md, padding:"12px 14px", marginTop:"4px" },
  valorViajeLabel:  { fontSize:t.fonts.sizeSm, color:t.colors.blue, fontWeight:t.fonts.weightMedium },
  valorViajeNum:    { fontSize:"20px", fontWeight:t.fonts.weightBlack, color:t.colors.blue },
  resumenBox:       { background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"10px 12px", marginTop:"8px" },
  resumenFila:      { display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeXs, padding:"4px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  resumenL:         { color:t.colors.textSecondary },
  resumenV:         { fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  filaAgregar:      { display:"flex", gap:"8px", alignItems:"center", marginBottom:"10px" },
  btnAgregarP:      { padding:"11px 14px", background:t.colors.blue, border:"none", borderRadius:t.radius.sm, cursor:"pointer", flexShrink:0 },
  peajesTags:       { display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"10px" },
  peajeTag:         { display:"inline-flex", alignItems:"center", background:t.colors.bgSection, border:`1px solid ${t.colors.border}`, borderRadius:t.radius.full, overflow:"hidden", fontSize:t.fonts.sizeXs },
  peajeTagNom:      { padding:"5px 10px", color:t.colors.textPrimary, fontWeight:t.fonts.weightMedium },
  peajeTagBtn:      { padding:"5px 8px", border:"none", borderLeft:`1px solid ${t.colors.border}`, cursor:"pointer", fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold },
  peajeTagDel:      { padding:"5px 8px", background:"none", border:"none", borderLeft:`1px solid ${t.colors.border}`, cursor:"pointer", display:"flex", alignItems:"center" },
  totalPeajesRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px" },
  totalPeajesL:     { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary },
  totalPeajesV:     { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary },
  extraFila:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  btnAgregarExtra:  { display:"flex", alignItems:"center", gap:"6px", width:"100%", padding:"10px", background:"none", border:`1.5px dashed ${t.colors.blueBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.blue, cursor:"pointer", justifyContent:"center", marginTop:"8px", fontWeight:t.fonts.weightSemibold },
  metCard:          { background:t.colors.bgSection, borderRadius:t.radius.sm, padding:"12px", marginBottom:"10px" },
  metLabel:         { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em" },
  metVal:           { fontSize:"17px", fontWeight:t.fonts.weightBold, margin:0 },
  gananciaResultBox:{ borderRadius:t.radius.md, padding:"16px", border:"1.5px solid", marginBottom:"14px", textAlign:"center" },
  gananciaResultLabel:{ fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, textTransform:"uppercase", letterSpacing:"0.08em", color:t.colors.textSecondary, margin:"0 0 6px" },
  gananciaResultVal:{ fontSize:"32px", fontWeight:t.fonts.weightBlack, margin:0, letterSpacing:"-0.5px" },
  desgloseFila:     { display:"flex", justifyContent:"space-between", fontSize:t.fonts.sizeSm, padding:"7px 0", borderBottom:`1px solid ${t.colors.borderLight}` },
  desgloseL:        { color:t.colors.textSecondary },
  desgloseV:        { fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary },
  barraFondo:       { height:"6px", borderRadius:"3px", background:t.colors.bgSection, overflow:"hidden", margin:"10px 0 14px" },
  barraRelleno:     { height:"100%", borderRadius:"3px", transition:"width 0.4s ease" },
  btnGuardar:       { width:"100%", padding:"15px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
};


// v2 - fix conductor
export default Calculadora;