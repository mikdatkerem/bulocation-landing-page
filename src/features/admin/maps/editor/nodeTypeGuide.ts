export function getNodeTypeGuide(nodeType: number, isParkingSpotNode: boolean) {
  if (nodeType === 3) {
    return 'Bina girisi yaya/ziyaretci hedefidir. Hastane, AVM veya tesis kapisi gibi noktalarda kullanin.';
  }

  if (nodeType === 4) {
    return 'Bina cikisi yaya/ziyaretci cikisidir. Normal tesis cikis rotalari bu noktayi hedefler.';
  }

  if (nodeType === 9) {
    return 'Otopark arac girisi, surucunun araci otoparka soktugu rampa veya kapidir. Bina girisi yerine kullanmayin.';
  }

  if (nodeType === 10) {
    return 'Otopark arac cikisi, surucunun otoparktan aracla ayrildigi cikistir. Otopark modundaki cikis rotalari bu noktayi hedefler.';
  }

  return isParkingSpotNode
    ? 'Bu nokta kaydedildiginde park kaydi ve QR kodu sistem tarafinda otomatik olusturulur.'
    : 'Bu nokta kaydedildiginde QR kodu sistem tarafinda otomatik olusturulur.';
}
