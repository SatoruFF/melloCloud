import { Anchor, Button, message } from 'antd';
import cn from 'classnames';
import { LazyMotion, domAnimation, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import storageIcon from '../../../shared/assets/cloud-data.png';
import desktopIcon from '../../../shared/assets/desktop.png';
import gitIcon from '../../../shared/assets/github-icon.png';
import mobileIcon from '../../../shared/assets/mobile-phone.png';
import mainLogo from '../../../shared/assets/octopus-kid.jpg';
import telegramLogo from '../../../shared/assets/telegram.png';
import twitterLogo from '../../../shared/assets/twitter.png';

import ParticleEffect from '../../../shared/ui/particleEffect/ParticleEffect';
import styles from '../styles/welcome.module.scss';
// import { useEffect } from 'react';

const Welcome = () => {
  const { t } = useTranslation();

  // For test error boundary
  // useEffect(() => {
  //   if (Math.random() < 0.5) {
  //     throw new Error();
  //   }
  // }, []);
  return (
    <div className={cn(styles.welcomeWrapper)}>
      <Anchor
        className={cn(styles.welcomeAnchor)}
        items={[
          {
            key: 'part-1',
            href: '#part-1',
            title: t('home-anchor.title'),
          },
          {
            key: 'part-2',
            href: '#part-2',
            title: t('home-anchor.more'),
          },
          {
            key: 'part-3',
            href: '#part-3',
            title: t('home-anchor.about'),
          },
        ]}
      />
      <div className={cn(styles.welcomeMain)} id="part-1">
        <svg className={cn(styles.wave)} viewBox="0 0 2 1" preserveAspectRatio="none">
          <defs>
            <path
              id="w"
              d="
            m0 1v-.5 
            q.5.5 1 0
            t1 0 1 0 1 0
            v.5z"
            />
          </defs>
          <g>
            <use href="#w" y=".0" fill="#2d55aa" />
            <use href="#w" y=".1" fill="#3461c1" />
            <use href="#w" y=".2" fill="#4579e2" />
          </g>
        </svg>
        <div className={cn(styles.contextMax)}>
          <div className={cn(styles.welcomeCard, 'animate__animated animate__fadeIn')}>
            <div className={cn(styles.leftSide)}>
              <div className={cn(styles.welcomeTitle)}>{t('primary-name')}</div>
              <div className={cn(styles.welcomeDescription, 'animate__animated animate__fadeInDown')}>
                {t('about-product')}
              </div>
            </div>
            <div className={cn(styles.rightSide)}>
              <LazyMotion features={domAnimation}>
                <motion.img src={mainLogo} animate={{ opacity: 1 }} />
              </LazyMotion>
            </div>
          </div>
        </div>
      </div>

      {/* second content space */}
      <div className={cn(styles.welcomeMore)} id="part-2">
        <ParticleEffect />
        <div className={cn(styles.moreTitle)}>{t('want-more')}</div>
        <div className={cn(styles.contentMax)}>
          <div className={cn(styles.moreContent)}>
            <div className={cn(styles.moreDesktopCard)}>
              <img src={desktopIcon} alt="desktop" loading="lazy" />
              <div className={cn(styles.moreDescription)}>{t('desktop')}</div>
              <Button type="primary" onClick={() => message.info('coming soon...')}>
                download
              </Button>
            </div>

            <div className={cn(styles.moreMobileCard)}>
              <img src={mobileIcon} alt="mobile" loading="lazy" />
              <div className={cn(styles.moreDescription)}>{t('mobile')}</div>
              <Button type="primary">
                <a href="https://wdfiles.ru/775e318" target="_blank" rel="noreferrer">
                  download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* third content space */}
      <div className={cn(styles.welcomeAbout)} id="part-3">
        <div className={cn(styles.aboutTitle)}>{t('about-title')}</div>
        <div className={cn(styles.contentMax)}>
          <div className={cn(styles.aboutContent)}>
            <div className={cn(styles.aboutDescription)}>{t('about-description')}</div>
            <div className={cn(styles.aboutLinks, 'aboutLinks')}>
              <img src={storageIcon} alt="storage" loading="lazy" className={cn(styles.storageLogo)} />
              <div className={cn(styles.socials, 'socials')}>
                <div className={cn(styles.socialsItem)}>
                  <a href="https://t.me/AlexDayy" target="_blank" rel="noreferrer">
                    <img src={telegramLogo} alt="telegram" loading="lazy" />
                  </a>
                </div>
                <div className={cn(styles.socialsItem)}>
                  <a href="https://github.com/SatoruFF" target="_blank" rel="noreferrer">
                    <img src={gitIcon} alt="instagram" loading="lazy" />
                  </a>
                </div>
                <div className={cn(styles.socialsItem)}>
                  <img src={twitterLogo} alt="twitter" loading="lazy" />{' '}
                </div>
              </div>
              <div className={cn(styles.aboutSignature)}>Made by SatoruF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
