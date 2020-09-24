var IDHAE = window.IDHAE || {};

!function($, window, document, _undefined)
{
    XF.AHSearch = XF.Element.newHandler({

        options: {
            results: '| .js-AHSearchResults',
            resultsWrapper: '| .js-AHSearchResultsWrapper',
            selecter: '| .js-quickSearch-constraint'
        },

        $input: null,
        $results: null,
        $resultsWrapper: null,
        $selector: null,
        xhr: null,

        init: function()
        {
            var $input = this.$target;
            var $form = $('form');
            this.$results = XF.findRelativeIf(this.options.results, $form);
            this.$resultsWrapper = XF.findRelativeIf(this.options.resultsWrapper, $form);
            $selector = this.options.selecter ? XF.findRelativeIf(this.options.selecter, $form) : $([]);

            if ($selector.length)
            {
                $selector.on('change', XF.proxy(this, 'changeSubmit'));
            }

            $input.attr('autocomplete', 'off')
                .on({
                    keyup: XF.proxy(this, 'keyup'),
                    paste: function()
                    {
                        setTimeout(function() { $input.trigger('keydown'); }, 0);
                    }
                });
        },

        keyup: function(e)
        {
            if (this.loadTimer)
            {
                clearTimeout(this.loadTimer);
            }

            this.loadTimer = setTimeout(XF.proxy(this, 'changeSubmit'), 10);
        },

        changeSubmit: function()
        {
            this.$resultsWrapper.hide();

            if (this.loadTimer)
            {
                clearTimeout(this.loadTimer);
            }

            this.loadVal = this.getPartialValue();

            if (this.loadVal == '')
            {
                this.$resultsWrapper.hide();
                return;
            }

            if (this.loadVal.length < 3)
            {
                return;
            }

            if (this.xhr)
            {
                this.xhr.abort();
            }

            this.xhr = XF.ajax(
                'post',
                XF.canonicalizeUrl('index.php?search/ahsearch'),
                $('form').serializeArray(),
                XF.proxy(this, 'showResults'),
                { global: false, error: false }
            );
        },


        showResults: function(results)
        {
            if (this.xhr)
            {
                this.xhr = false;
            }

            var $results = this.$results, $resultsWrapper = this.$resultsWrapper;

            if (results.html)
            {
                XF.setupHtmlInsert(results.html, function($html, results, onComplete)
                {
                    if ($html.length)
                    {
                        $results.html($html);
                        $resultsWrapper.show();
                        onComplete();

                        $('.ahsearch-form').find('.js-quickSearch-slink').click(function()
                        {
                            $('.ahsearch-form').submit();
                        });

                        $results.find('a').hover(
                            function() { $(this).addClass('is-active'); },
                            function() { $(this).removeClass('is-active'); }
                        );
                    }
                });
            }
        },

        getPartialValue: function()
        {
            var val = this.$target.val(),
                splitPos;

            if (this.options.single)
            {
                return $.trim(val);
            }
            else
            {
                splitPos = val.lastIndexOf(this.options.multiple);
                if (splitPos == -1)
                {
                    return $.trim(val);
                }
                else
                {
                    return $.trim(val.substr(splitPos + this.options.multiple.length));
                }
            }
        }

    });


    XF.Element.register('ahsearch', 'XF.AHSearch');
}
(jQuery, window, document);