/**
 * Generates an exact pixel-perfect high-resolution PNG image matching the
 * Full Milestone Certificate modal design (Image 1: Trophy, Congratulations,
 * 7-Day Master Card, and Official Certification) and triggers a download.
 */
export function exportLoyaltyCardAsImage({
  userName = 'Guest',
  profession = 'Trader',
  streak = 0,
  unlocked = false,
}) {
  try {
    const isGoldMaster = unlocked || streak >= 7;
    // Strict requirement: Cannot download until full 7 days of consistency are completed
    if (!isGoldMaster) {
      console.warn('Cannot download pass: 7 full days of continuous journaling required.');
      return false;
    }
    const progress = 7;

    // Full certificate card dimensions
    const width = 1100;
    const height = 1160;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return false;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const pad = 30;
    const outerX = pad;
    const outerY = pad;
    const outerW = width - pad * 2;
    const outerH = height - pad * 2;
    const outerRadius = 24;

    // 1. Outer Container Shadow (Offset ink shadow)
    ctx.save();
    ctx.fillStyle = '#10252d';
    ctx.beginPath();
    ctx.roundRect(outerX + 8, outerY + 8, outerW, outerH, outerRadius);
    ctx.fill();
    ctx.restore();

    // 2. Outer Container Background (Parchment Paper #fafbf9)
    ctx.save();
    ctx.fillStyle = '#fafbf9';
    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, outerRadius);
    ctx.fill();

    // Dark crisp 2.5px border
    ctx.strokeStyle = '#10252d';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 3. Top Trophy Icon (🏆)
    ctx.save();
    ctx.font = '72px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', width / 2, outerY + 95);
    ctx.restore();

    // 4. Milestone Achieved Title
    ctx.save();
    ctx.fillStyle = '#10252d';
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '-0.5px';
    ctx.fillText('Consistency Milestone Achieved', width / 2, outerY + 165);
    ctx.restore();

    // 5. Congratulatory Subtitle
    const profName = profession.toLowerCase().endsWith('logbook') || profession.toLowerCase().endsWith('journal')
      ? profession
      : `${profession} logbook`;
    const cleanUser = userName || 'Guest';

    ctx.save();
    ctx.fillStyle = '#4a5f66';
    ctx.textAlign = 'center';
    ctx.font = '500 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Congratulations, ${cleanUser}! You have maintained a continuous 7-day`, width / 2, outerY + 218);
    ctx.fillText(`journaling streak in your ${profName}.`, width / 2, outerY + 252);
    ctx.restore();

    // 6. Inner Obsidian & Gold 3D Card
    const cardX = outerX + 45;
    const cardY = outerY + 295;
    const cardW = outerW - 90;
    const cardH = 680;
    const cardRadius = 20;

    // Card 3D Offset Shadow
    ctx.save();
    ctx.fillStyle = '#060e12';
    ctx.beginPath();
    ctx.roundRect(cardX + 6, cardY + 6, cardW, cardH, cardRadius);
    ctx.fill();
    ctx.strokeStyle = '#ffd84d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Card Background Surface (#111e24 -> #0d1a20)
    ctx.save();
    const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    bgGrad.addColorStop(0, '#12222a');
    bgGrad.addColorStop(0.5, '#172d37');
    bgGrad.addColorStop(1, '#0c181e');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
    ctx.fill();

    // Gold Outer Border
    ctx.strokeStyle = '#ffd84d';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 7. Card Header (Book Icon + "Daybook Club" + "★ 7-DAY MASTER PASS" Pill)
    const cardHeaderY = cardY + 54;

    // Bookmark Icon
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX + 40, cardHeaderY - 22, 26, 32, 4);
    ctx.fill();
    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.roundRect(cardX + 40, cardHeaderY - 22, 8, 32, [4, 0, 0, 4]);
    ctx.fill();

    // "Daybook Club"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Daybook Club', cardX + 78, cardHeaderY + 4);
    ctx.restore();

    // "★ 7-DAY MASTER PASS" Gold Pill Badge
    ctx.save();
    const pillText = isGoldMaster ? '★ 7-DAY MASTER PASS' : `${progress}/7 DAYS`;
    ctx.font = 'bold 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const pillWidth = ctx.measureText(pillText).width + 32;
    const pillHeight = 36;
    const pillX = cardX + cardW - 40 - pillWidth;
    const pillY = cardHeaderY - 22;

    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 18);
    ctx.fill();

    ctx.fillStyle = '#10252d';
    ctx.textAlign = 'center';
    ctx.fillText(pillText, pillX + pillWidth / 2, pillY + 23);
    ctx.restore();

    // 8. Card Member Details (🏛️ + CERTIFIED HOLDER + Name + Profession)
    const memberY = cardY + 165;

    // Roman Pillar Icon (🏛️)
    ctx.save();
    ctx.font = '54px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏛️', cardX + 38, memberY + 38);
    ctx.restore();

    // Details column
    const textX = cardX + 116;
    ctx.save();
    ctx.fillStyle = '#8ca0c8';
    ctx.font = 'bold 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.textAlign = 'left';
    ctx.fillText('CERTIFIED HOLDER', textX, memberY - 4);

    // User Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(cleanUser, textX, memberY + 36);

    // Profession
    ctx.fillStyle = '#ffd84d';
    ctx.font = '600 18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(profession.toLowerCase().endsWith('logbook') || profession.toLowerCase().endsWith('journal') ? profession : `${profession} Logbook`, textX, memberY + 68);
    ctx.restore();

    // 9. 7 Yellow Gold Stamped Boxes (D1 through D7 with ✓)
    const stampsY = cardY + 320;
    const stampWidth = 108;
    const stampHeight = 98;
    const totalStampsW = 7 * stampWidth;
    const availableSpace = cardW - 80;
    const stampGap = (availableSpace - totalStampsW) / 6;

    for (let i = 1; i <= 7; i++) {
      const sx = cardX + 40 + (i - 1) * (stampWidth + stampGap);
      const isStamped = i <= progress || isGoldMaster;

      ctx.save();
      if (isStamped) {
        // Glowing gold shadow
        ctx.shadowColor = 'rgba(255, 216, 77, 0.5)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;

        // Solid Yellow Gold Box
        ctx.fillStyle = '#ffd84d';
        ctx.beginPath();
        ctx.roundRect(sx, stampsY, stampWidth, stampHeight, 14);
        ctx.fill();

        // Stamped Text
        ctx.fillStyle = '#10252d';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`D${i}`, sx + stampWidth / 2, stampsY + 34);

        ctx.font = 'bold 32px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('✓', sx + stampWidth / 2, stampsY + 76);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(sx, stampsY, stampWidth, stampHeight, 14);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`D${i}`, sx + stampWidth / 2, stampsY + 34);

        ctx.font = 'bold 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('○', sx + stampWidth / 2, stampsY + 74);
      }
      ctx.restore();
    }

    // 10. Card Footer Divider Line and Labels
    const cardFootY = cardY + cardH - 46;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(cardX + 40, cardY + cardH - 84, cardW - 80, 1);

    // Left: "★ OFFICIAL 7-DAY CONSISTENCY PROOF"
    ctx.fillStyle = '#8ca0c8';
    ctx.font = 'bold 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('★ OFFICIAL 7-DAY CONSISTENCY PROOF', cardX + 40, cardFootY);

    // Right: "GOLD VERIFIED"
    ctx.fillStyle = '#ffd84d';
    ctx.font = 'bold 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('GOLD VERIFIED', cardX + cardW - 40, cardFootY);
    ctx.restore();

    // 11. Certificate Bottom Seal / Brand Signature
    const certFootY = outerY + outerH - 34;
    ctx.save();
    ctx.fillStyle = '#7a8f96';
    ctx.font = '600 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Daybook • Daily Consistency System • Verified Milestone Award', width / 2, certFootY);
    ctx.restore();

    // 12. Trigger High-Res Download (Blob + DataURL Fallback)
    const filename = `Daybook-Consistency-Milestone-${cleanUser.replace(/\s+/g, '_')}.png`;

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) {
          fallbackDataUrlDownload(canvas, filename);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 1000);
      }, 'image/png');
    } else {
      fallbackDataUrlDownload(canvas, filename);
    }

    return true;
  } catch (err) {
    console.error('Error exporting loyalty certificate image:', err);
    return false;
  }
}

function fallbackDataUrlDownload(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 1000);
}

/**
 * Handles Web Share API or falls back to copying share message to clipboard
 */
export async function shareLoyaltyPass({
  userName = 'Guest',
  profession = 'Trader',
  streak = 0,
  unlocked = false,
}) {
  const isGoldMaster = unlocked || streak >= 7;
  if (!isGoldMaster) {
    return { success: false, error: '7-day streak required' };
  }

  const text = `🏆 I achieved the 7-Day Consistency Milestone on Daybook (${profession} Logbook)! 7 consecutive days of unbroken discipline. Check out Daybook:`;
  const url = window.location.origin;

  if (navigator.share) {
    try {
      await navigator.share({
        title: isGoldMaster ? '7-Day Consistency Milestone Award' : 'Daybook Consistency Pass',
        text,
        url,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard?.writeText(`${text} ${url}`);
        return { success: true, method: 'clipboard' };
      }
      return { success: false, method: 'aborted' };
    }
  } else {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
    }
    return { success: true, method: 'clipboard' };
  }
}
