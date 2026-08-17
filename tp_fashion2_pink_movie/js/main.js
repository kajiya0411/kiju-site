//===============================================================
// メニュー制御用の関数とイベント設定（※バージョン2026-2）
//===============================================================
$(function(){
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const breakPoint = 9999;	// ここがブレイクポイント指定箇所です

  // ▼ここを切り替えるだけで 2パターンを使い分け！
  //   false → “従来どおり”
  //   true  → “ハンバーガーが非表示の間は #menubar も非表示”
  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0) ||
                       (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    // ドロップダウンメニューが存在するliにクラス追加
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    // 子メニューは初期状態で閉じる（ちらつき防止）
    $menu.find('.ddmenu_parent ul').hide();

    // 万一の再初期化に備えてイベントを解除（多重バインド防止）
    $menu.find('.ddmenu').off('click.ddmenu');
    $menu.find('.ddmenu_parent').off('mouseenter.ddmenu mouseleave.ddmenu');

    //---------------------------------------------
    // ▼ブレイクポイント未満（開閉メニュー時）は
    //   PCでも「クリックで開閉」に統一（hover無効）
    //---------------------------------------------
    $menu.find('.ddmenu').on('click.ddmenu', function(e) {
      if (!isTouch && $(window).width() >= breakPoint) return; // PC大画面はhover運用

      e.preventDefault();
      e.stopPropagation();

      const $dropdownMenu = $(this).siblings('ul');
      if ($dropdownMenu.is(':visible')) {
        $dropdownMenu.hide();
      } else {
        $menu.find('.ddmenu_parent ul').hide(); // 他を閉じる
        $dropdownMenu.show();
      }
    });

    //---------------------------------------------
    // ▼PC大画面（breakPoint以上）のみ hover で開閉
    //---------------------------------------------
    $menu.find('.ddmenu_parent').on('mouseenter.ddmenu', function() {
      if (isTouch) return;
      if ($(window).width() < breakPoint) return; // 開閉メニュー時はhover無効
      $(this).children('ul').show();
    }).on('mouseleave.ddmenu', function() {
      if (isTouch) return;
      if ($(window).width() < breakPoint) return; // 開閉メニュー時はhover無効
      $(this).children('ul').hide();
    });
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger, $menu) {
    $hamburger.on('click', function() {
      $(this).toggleClass('ham');
      if ($(this).hasClass('ham')) {
        $menu.show();
        // ▼ ブレイクポイント未満でハンバーガーが開いたら body のスクロール禁止
        //    （メニューが画面いっぱいに fixed 表示されている時に背後をスクロールさせないため）
        if ($(window).width() < breakPoint) {
          $('body').addClass('noscroll');  // ★追加
        }
      } else {
        $menu.hide();
        // ▼ ハンバーガーを閉じたらスクロール禁止を解除
        if ($(window).width() < breakPoint) {
          $('body').removeClass('noscroll');  // ★追加
        }
      }
      // ドロップダウン部分も一旦閉じる
      $menu.find('.ddmenu_parent ul').hide();
    });
  }

  //-------------------------------------------------
  // レスポンシブ時の表示制御 (リサイズ時)
  //-------------------------------------------------
  const handleResize = debounce(function() {
    const windowWidth = $(window).width();

    // bodyクラスの制御 (small-screen / large-screen)
    if (windowWidth < breakPoint) {
      $('body').removeClass('large-screen').addClass('small-screen');
    } else {
      $('body').removeClass('small-screen').addClass('large-screen');
      // PC表示になったら、ハンバーガー解除 + メニューを開く
      $menubarHdr.removeClass('ham');
      $menubar.find('.ddmenu_parent ul').hide();

      // ▼ PC表示に切り替わったらスクロール禁止も解除しておく (保険的な意味合い)
      $('body').removeClass('noscroll'); // ★追加

      // ▼ #menubar を表示するか/しないかの切り替え
      if (HIDE_MENUBAR_IF_HDR_HIDDEN) {
        $menubarHdr.hide();
        $menubar.hide();
      } else {
        $menubarHdr.hide();
        $menubar.show();
      }
    }

    // スマホ(ブレイクポイント未満)のとき
    if (windowWidth < breakPoint) {
      $menubarHdr.show();
      if (!$menubarHdr.hasClass('ham')) {
        $menubar.hide();
        // ▼ ハンバーガーが閉じている状態ならスクロール禁止も解除
        $('body').removeClass('noscroll'); // ★追加
      }
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  // 1) ドロップダウン初期化 (#menubar)
  initDropdown($menubar, isTouchDevice);

  // 2) ハンバーガーメニュー初期化 (#menubar_hdr + #menubar)
  initHamburger($menubarHdr, $menubar);

  // 3) レスポンシブ表示の初期処理 & リサイズイベント
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント
  //-------------------------------------------------
  $menubar.find('a[href^="#"]').on('click', function() {
    // ドロップダウンメニューの親(a.ddmenu)のリンクはメニューを閉じない
    if ($(this).hasClass('ddmenu')) return;

    // スマホ表示＆ハンバーガーが開いている状態なら閉じる
    if ($menubarHdr.is(':visible') && $menubarHdr.hasClass('ham')) {
      $menubarHdr.removeClass('ham');
      $menubar.hide();
      $menubar.find('.ddmenu_parent ul').hide();
      // ハンバーガーが閉じたのでスクロール禁止を解除
      $('body').removeClass('noscroll'); // ★追加
    }
  });

  //-------------------------------------------------
  // 「header nav」など別メニューにドロップダウンだけ適用したい場合
  //-------------------------------------------------
  // 例：header nav へドロップダウンだけ適用（ハンバーガー連動なし）
  //initDropdown($('header nav'), isTouchDevice);
});


//===============================================================
// ドロップダウン専用（#menubar2）
//===============================================================
$(function () {

	// ▼ 適用先（ここだけ変えれば他のメニューにも流用OK）
	var $menu = $('#menubar2');
	if (!$menu.length) return;

	// ▼ 親リンクの挙動（スマホ/タッチ系）
	// true  : 1回目=開く、2回目=リンクへ移動（推奨）
	// false : 常に開閉のみ（親リンクへは移動しない）
	var SECOND_TAP_NAVIGATES = true;

	// タッチ系判定（hoverできない端末を優先して判定）
	var isTouchLike = false;
	if (window.matchMedia) {
		isTouchLike = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
	} else {
		isTouchLike = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
	}

	// ------------------------------------------------------------
	// 初期化本体
	// ------------------------------------------------------------
	function initDropdown($menu, touchMode) {

		// 多重バインド防止（このスクリプトだけの名前空間）
		$menu.find('.ddmenu').off('.dd2');
		$menu.find('.ddmenu_parent').off('.dd2');
		$menu.find('.ddmenu_parent > ul a').off('.dd2');
		$(document).off('.dd2');
		$(window).off('.dd2');

		// 「子ulを持つli」にクラス付与（既に付いててもOK）
		$menu.find('li').each(function () {
			var $li = $(this);
			if ($li.children('ul').length) {
				$li.addClass('ddmenu_parent');
				$li.children('a').addClass('ddmenu')
					.attr('aria-haspopup', 'true')
					.attr('aria-expanded', 'false');
			}
		});

		function closeAll() {
			$menu.find('.ddmenu_parent > ul').hide();
			$menu.find('.ddmenu').attr('aria-expanded', 'false');
		}

		// 初期は閉じる
		closeAll();

		if (touchMode) {
			// -------------------------
			// タッチ系：タップで開閉
			// -------------------------
			$menu.find('.ddmenu').on('click.dd2', function (e) {
				var $a = $(this);
				var $ul = $a.siblings('ul');
				if (!$ul.length) return;

				var href = ($a.attr('href') || '').trim();
				var isDummyLink = (href === '' || href === '#' || href.indexOf('#') === 0);

				// 閉じている → まず開く（この時は遷移させない）
				if (!$ul.is(':visible')) {
					e.preventDefault();
					e.stopPropagation();
					closeAll();
					$ul.show();
					$a.attr('aria-expanded', 'true');
					return;
				}

				// 開いている → 挙動切替
				if (SECOND_TAP_NAVIGATES && !isDummyLink) {
					// 2回目は遷移（preventDefaultしない）
					return;
				} else {
					// 開閉のみ（またはダミーリンクの場合は閉じる）
					e.preventDefault();
					e.stopPropagation();
					$ul.hide();
					$a.attr('aria-expanded', 'false');
				}
			});

			// メニュー外タップで閉じる
			$(document).on('click.dd2 touchstart.dd2', function () {
				closeAll();
			});

			// メニュー内クリックは外側判定に流さない
			$menu.on('click.dd2 touchstart.dd2', function (e) {
				e.stopPropagation();
			});

			// 子メニュー項目を押したら閉じる（必要なら残してOK）
			$menu.find('.ddmenu_parent > ul a').on('click.dd2', function () {
				closeAll();
			});

		} else {
			// -------------------------
			// PC：ホバーで開閉
			// -------------------------
			$menu.find('.ddmenu_parent').on('mouseenter.dd2', function () {
				$(this).children('ul').show();
				$(this).children('a.ddmenu').attr('aria-expanded', 'true');
			}).on('mouseleave.dd2', function () {
				$(this).children('ul').hide();
				$(this).children('a.ddmenu').attr('aria-expanded', 'false');
			});

			// Escapeキーで閉じる（地味に便利）
			$(window).on('keydown.dd2', function (e) {
				if (e.key === 'Escape') closeAll();
			});
		}
	}

	// 実行
	initDropdown($menu, isTouchLike);

});


//===============================================================
// スムーススクロール（※バージョン2025-3）
// 通常タイプ / fixedヘッダー対応 切り替え版
//===============================================================
$(function() {

    //===========================================================
    // 設定
    //===========================================================
    // 'normal' ＝ 通常タイプ（固定ヘッダーなし）
    // 'fixed' ＝ fixedヘッダー対応
    var scrollType = 'normal';

    // fixedヘッダー時に位置計算に使う要素（※fixed版を使う際は必ずチェック。画面上部に貼り付くブロックを指定する。）
    // 例：'header' / '#header' / '.site-header'
    var fixedHeaderSelector = '#menubar';

    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');

    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';


    //===========================================================
    // fixedヘッダーぶんの補正値を取得
    //===========================================================
    function getHeaderOffset() {

        // 通常タイプなら補正なし
        if(scrollType !== 'fixed') {
            return 0;
        }

        // 指定要素を取得
        var $header = $(fixedHeaderSelector);

        // 要素がなければ補正なし
        if(!$header.length) {
            return 0;
        }

        // 画面上でのヘッダー下端位置を取得
        // 高さ + 上部の余白(topやmarginで見た目上ずれている分)も含めて見られる
        var rect = $header.get(0).getBoundingClientRect();

        // 念のためマイナスは0にする
        return Math.max(0, rect.bottom);
    }


    //===========================================================
    // スムーススクロール本体
    //===========================================================
    function smoothScroll(target) {

        var scrollTo = 0;

        // '#' の場合はページ最上部へ
        if(target === '#') {
            scrollTo = 0;

        } else {

            // スクロール先の要素を取得
            var $target = $(target);

            // 対象が存在しない場合は何もしない
            if(!$target.length) {
                return;
            }

            // 通常位置から、fixedヘッダー分を引く
            scrollTo = $target.offset().top - getHeaderOffset();

            // 0未満にならないように補正
            if(scrollTo < 0) {
                scrollTo = 0;
            }
        }

        // アニメーションでスムーススクロール
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

	//===========================================================
	// ページ内リンク / ページトップボタン
	//===========================================================
	$('a[href^="#"], .pagetop').click(function(e) {

		// hrefが無い.pagtopでも '#' 扱いにする
		var id = $(this).attr('href') || '#';

		// .pagetop 以外の href="#" は無視（その場に止める）
		if(id === '#' && !$(this).hasClass('pagetop')) {
			e.preventDefault();
			return;
		}

		e.preventDefault();
		smoothScroll(id);
	});

    //===========================================================
    // ページトップボタンの表示切り替え
    //===========================================================
    $(topButton).hide();

    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) {
            $(topButton).fadeIn().addClass(scrollShow);
        } else {
            $(topButton).fadeOut().removeClass(scrollShow);
        }
    });


    //===========================================================
    // ハッシュ付きURLで開いた時
    //===========================================================
    if(window.location.hash) {
        $('html, body').scrollTop(0);

        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 500);
    }

});


//===============================================================
// サムネイルスライドショー
//===============================================================
$(document).ready(function() {
    // 各 .img を個別に処理
    $('.slideimg .img').each(function() {
        var $imgParts = $(this);
        var $divs = $imgParts.children('div');
        var divCount = $divs.length;

        // 各 div の幅を計算
        var divWidth = 100 / (divCount * 2);

        // サムネイルの枚数に応じてアニメーション時間と幅を計算
        var animationTime = (divCount / 4) * 40 + 's';
        var slideWidth = (divCount / 4) * 200 + '%';

        // 各 div に幅を設定
        $divs.css({
            'flex': '0 0 ' + divWidth + '%',
            'width': divWidth + '%'
        });

        // .img に animation と width を設定
        $imgParts.css({
            'animation-duration': animationTime,
            'width': slideWidth
        });

        // 初期ロード時に子要素を複製して追加
        $divs.clone().appendTo($imgParts);

        // サムネイルにマウスが乗った時にアニメーションを一時停止
        $imgParts.on('mouseenter', function() {
            $(this).css('animation-play-state', 'paused');
        });

        // サムネイルからマウスが離れた時にアニメーションを再開
        $imgParts.on('mouseleave', function() {
            $(this).css('animation-play-state', 'running');
        });
    });
});


//===============================================================
//	list-yoko-scroll2（縦スクロール → 横スクロールギャラリー）
//===============================================================
$(function(){

	$('.list-yoko-scroll2').each(function(){

		var $wrap    = $(this);
		var $sticky  = $wrap.find('.hscroll1-sticky');
		var $track   = $wrap.find('.hscroll1-track');
		var $skip    = $wrap.find('button[aria-label="skip gallery"]');
		var $prog    = $wrap.find('.hscroll1-progress');
		var $progBar = $wrap.find('.hscroll1-progress-bar');
		var speed    = parseFloat($wrap.attr('data-speed')) || 1;

		/* スキップボタン：セクション末尾へジャンプ */
		$skip.on('click', function(){
			var endPos = $wrap.offset().top + $wrap.outerHeight();
			$('html, body').animate({ scrollTop: endPos }, 400);
		});

		/* スクロール処理 */
		$(window).on('scroll resize', function(){

			var wrapTop    = $wrap.offset().top;
			var wrapHeight = $wrap.outerHeight();
			var scrollY    = $(window).scrollTop();
			var viewH      = $(window).height();

			/* セクション内にいるかどうか */
			var inSection = (scrollY >= wrapTop) && (scrollY <= wrapTop + wrapHeight - viewH);

			/* スキップボタンと進捗バーの表示切替 */
			if(inSection){
				$skip.addClass('is-visible');
				$prog.addClass('is-visible');
			} else {
				$skip.removeClass('is-visible');
				$prog.removeClass('is-visible');
			}

			/* 横スクロール量の計算 */
			var scrollRange  = wrapHeight - viewH;
			var scrollAmount = scrollY - wrapTop;
			var progress     = Math.max(0, Math.min(1, scrollAmount / scrollRange));

			/* トラックの移動可能距離 */
			var trackW  = $track[0].scrollWidth;
			var stickyW = $sticky.width();
			var maxMove = trackW - stickyW;

			/* transform で横移動 */
			var translateX = -1 * progress * maxMove * speed;
			translateX = Math.max(-maxMove, Math.min(0, translateX));
			$track.css('transform', 'translateX(' + translateX + 'px)');

			/* 進捗バー更新 */
			$progBar.css('width', (progress * 100) + '%');

		});

	});

});


//===============================================================
// 動画（見えない間はストップ）複数対応版
// html側の.video-zoneと.bgVideoの付与を忘れず。
//===============================================================
(() => {
  const zones = document.querySelectorAll(".video-zone");
  if (!zones.length) return;

  // 省データ/動き少なめ希望は静止画のまま
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const saveData = navigator.connection?.saveData;
  if (reduceMotion || saveData) {
    zones.forEach(zone => {
      const v = zone.querySelector("video");
      if (!v) return;
      try { v.pause(); } catch(e) {}
    });
    return;
  }

  const instances = [];

  zones.forEach(zone => {
    // zoneの中の video を対象に（.bgVideoがあれば優先）
    const v = zone.querySelector("video.bgVideo") || zone.querySelector("video");
    if (!v) return;

    const playSafe  = () => v.play().catch(() => {});
    const pauseSafe = () => {
      try { v.pause(); } catch(e) {}
      try { v.currentTime = 0; } catch(e) {}
    };

    let startedLoading = false;
    const startLoadingOnce = () => {
      if (startedLoading) return;
      startedLoading = true;
      try { v.preload = "auto"; } catch(e) {}
      try { v.load(); } catch(e) {}
    };

    let zoneVisible = false;

    const update = () => {
      if (document.hidden) { pauseSafe(); return; }

      if (zoneVisible) {
        startLoadingOnce();
        playSafe();
      } else {
        pauseSafe();
      }
    };

    // 初期状態（ページ途中から開いた時など）
    const r = zone.getBoundingClientRect();
    zoneVisible = (r.bottom > 0 && r.top < window.innerHeight);
    update();

    instances.push({
      zone,
      setVisible: (vis) => { zoneVisible = vis; update(); },
      update,
      pauseSafe,
    });
  });

  if (!instances.length) return;

  const map = new Map(instances.map(inst => [inst.zone, inst]));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const inst = map.get(e.target);
      if (!inst) return;
      inst.setVisible(e.isIntersecting);
    });
  }, { threshold: 0.01 });

  instances.forEach(inst => io.observe(inst.zone));

  // タブ非表示なら停止
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) instances.forEach(inst => inst.pauseSafe());
    else instances.forEach(inst => inst.update());
  });
})();
