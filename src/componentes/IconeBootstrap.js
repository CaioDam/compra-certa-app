import Cpu from 'bootstrap-icons/icons/cpu-fill.svg';
import Controle from 'bootstrap-icons/icons/controller.svg';
import PlacaMae from 'bootstrap-icons/icons/motherboard.svg';
import Memoria from 'bootstrap-icons/icons/memory.svg';
import Ssd from 'bootstrap-icons/icons/device-ssd.svg';
import Televisao from 'bootstrap-icons/icons/tv.svg';
import Notebook from 'bootstrap-icons/icons/laptop.svg';
import Celular from 'bootstrap-icons/icons/phone.svg';
import Cadeira from 'bootstrap-icons/icons/joystick.svg';
import Casa from 'bootstrap-icons/icons/house-door.svg';
import Cesta from 'bootstrap-icons/icons/basket.svg';
import Estrela from 'bootstrap-icons/icons/star-fill.svg';
import Pessoa from 'bootstrap-icons/icons/person.svg';
import Localizacao from 'bootstrap-icons/icons/geo-alt.svg';
import Camera from 'bootstrap-icons/icons/camera.svg';
import Caixa from 'bootstrap-icons/icons/box-seam.svg';
import Sino from 'bootstrap-icons/icons/bell.svg';
import Comparacao from 'bootstrap-icons/icons/columns-gap.svg';
import Wifi from 'bootstrap-icons/icons/wifi.svg';
import SetaDireita from 'bootstrap-icons/icons/arrow-right.svg';

const icones = {
  cpu: Cpu,
  controle: Controle,
  placaMae: PlacaMae,
  memoria: Memoria,
  ssd: Ssd,
  televisao: Televisao,
  notebook: Notebook,
  celular: Celular,
  cadeira: Cadeira,
  casa: Casa,
  cesta: Cesta,
  estrela: Estrela,
  pessoa: Pessoa,
  localizacao: Localizacao,
  camera: Camera,
  caixa: Caixa,
  sino: Sino,
  comparacao: Comparacao,
  wifi: Wifi,
  setaDireita: SetaDireita,
};

export default function IconeBootstrap({ nome, tamanho = 20, cor = '#000000', style }) {
  const Icone = icones[nome];

  if (!Icone) return null;

  return <Icone width={tamanho} height={tamanho} fill={cor} color={cor} style={style} />;
}