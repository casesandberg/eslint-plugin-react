/**
 * @fileoverview Enforce or disallow spaces inside of curly braces in JSX attributes.
 * @author Jamund Ferguson
 * @author Brandyn Bennett
 * @author Michael Ficarra
 * @author Vignesh Anand
 * @author Jamund Ferguson
 * @author Yannick Croissant
 * @author Erik Wendel
 */
'use strict';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = function(context) {

  var sourceCode = context.getSourceCode();
  var spaced = context.options[0] === 'always';
  var multiline = context.options[1] ? context.options[1].allowMultiline : true;
  var alternative = context.options[1] ? context.options[1].alternative : false;

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  /**
   * Determines whether two adjacent tokens have a newline between them.
   * @param {Object} left - The left token object.
   * @param {Object} right - The right token object.
   * @returns {boolean} Whether or not there is a newline between the tokens.
   */
  function isMultiline(left, right) {
    return left.loc.start.line !== right.loc.start.line;
  }

  /**
  * Reports that there shouldn't be a newline after the first token
  * @param {ASTNode} node - The node to report in the event of an error.
  * @param {Token} token - The token to use for the report.
  * @returns {void}
  */
  function reportNoBeginningNewline(node, token) {
    context.report({
      node: node,
      loc: token.loc.start,
      message: 'There should be no newline after \'' + token.value + '\'',
      fix: function(fixer) {
        var nextToken = context.getSourceCode().getTokenAfter(token);
        return fixer.replaceTextRange([token.range[1], nextToken.range[0]], spaced ? ' ' : '');
      }
    });
  }

  /**
  * Reports that there shouldn't be a newline before the last token
  * @param {ASTNode} node - The node to report in the event of an error.
  * @param {Token} token - The token to use for the report.
  * @returns {void}
  */
  function reportNoEndingNewline(node, token) {
    context.report({
      node: node,
      loc: token.loc.start,
      message: 'There should be no newline before \'' + token.value + '\'',
      fix: function(fixer) {
        var previousToken = context.getSourceCode().getTokenBefore(token);
        return fixer.replaceTextRange([previousToken.range[1], token.range[0]], spaced ? ' ' : '');
      }
    });
  }

  /**
  * Reports that there shouldn't be a space after the first token
  * @param {ASTNode} node - The node to report in the event of an error.
  * @param {Token} token - The token to use for the report.
  * @returns {void}
  */
  function reportNoBeginningSpace(node, token) {
    context.report({
      node: node,
      loc: token.loc.start,
      message: 'There should be no space after \'' + token.value + '\'',
      fix: function(fixer) {
        var nextToken = context.getSourceCode().getTokenAfter(token);
        return fixer.removeRange([token.range[1], nextToken.range[0]]);
      }
    });
  }

  /**
  * Reports that there shouldn't be a space before the last token
  * @param {ASTNode} node - The node to report in the event of an error.
  * @param {Token} token - The token to use for the report.
  * @returns {void}
  */
  function reportNoEndingSpace(node, token) {
    context.report({
      node: node,
      loc: token.loc.start,
      message: 'There should be no space before \'' + token.value + '\'',
      fix: function(fixer) {
        var previousToken = context.getSourceCode().getTokenBefore(token);
        return fixer.removeRange([previousToken.range[1], token.range[0]]);
      }
    });
  }

  /**
  * Reports that there should be a space after the first token
  * @param {ASTNode} node - The node to report in the event of an error.
  * @param {Token} token - The token to use for the report.
  * @returns {void}
  */
  function reportRequiredBeginningSpace(node, token) {
    context.report({
      node: node,
      loc: token.loc.start,
      message: 'A space is required after \'' + token.value + '\'',
      fix: function(fixer) {
        return fixer.insertTextAfter(token, ' ');
      }
    });
  }

  /**
  * Reports that there should be a space before the last token
  * @param {ASTNode} node - The node to report in the event of an error.
  * @param {Token} token - The token to use for the report.
  * @returns {void}
  */
  function reportRequiredEndingSpace(node, token) {
    context.report({
      node: node,
      loc: token.loc.start,
      message: 'A space is required before \'' + token.value + '\'',
      fix: function(fixer) {
        return fixer.insertTextBefore(token, ' ');
      }
    });
  }

  /**
   * Determines if spacing in curly braces is valid.
   * @param {ASTNode} node The AST node to check.
   * @param {Token} first The first token to check (should be the opening brace)
   * @param {Token} second The second token to check (should be first after the opening brace)
   * @param {Token} penultimate The penultimate token to check (should be last before closing brace)
   * @param {Token} last The last token to check (should be closing brace)
   * @returns {void}
   */
  function validateBraceSpacing(node, first, second, third, antepenultimate, penultimate, last) {
    if (spaced) {
      if (!alternative) {
        if (!sourceCode.isSpaceBetweenTokens(first, second)) {
          reportRequiredBeginningSpace(node, first);
        } else if (!multiline && isMultiline(first, second)) {
          reportNoBeginningNewline(node, first);
        }

        if (!sourceCode.isSpaceBetweenTokens(penultimate, last)) {
          reportRequiredEndingSpace(node, last);
        } else if (!multiline && isMultiline(penultimate, last)) {
          reportNoEndingNewline(node, last);
        }

      // Object literal
      } else if (first.value === second.value) {
        if (sourceCode.isSpaceBetweenTokens(first, second)) {
          reportNoBeginningSpace(node, first);
        }
        if (sourceCode.isSpaceBetweenTokens(penultimate, last)) {
          reportNoEndingSpace(node, last);
        }
        if (!sourceCode.isSpaceBetweenTokens(second, third)) {
          reportRequiredBeginningSpace(node, second);
        }
        if (!sourceCode.isSpaceBetweenTokens(antepenultimate, penultimate)) {
          reportRequiredEndingSpace(node, penultimate);
        }

      } else {
        if (!sourceCode.isSpaceBetweenTokens(first, second)) {
          reportRequiredBeginningSpace(node, first);
        }
        if (!sourceCode.isSpaceBetweenTokens(penultimate, last)) {
          reportRequiredEndingSpace(node, last);
        }
      }

      return;
    }

    // "never" setting if we get here.
    if (sourceCode.isSpaceBetweenTokens(first, second) && !(multiline && isMultiline(first, second))) {
      reportNoBeginningSpace(node, first);
    }

    if (sourceCode.isSpaceBetweenTokens(penultimate, last) && !(multiline && isMultiline(penultimate, last))) {
      reportNoEndingSpace(node, last);
    }
  }

  // --------------------------------------------------------------------------
  // Public
  // --------------------------------------------------------------------------

  return {
    JSXExpressionContainer: function(node) {
      var first = context.getFirstToken(node);
      var last = sourceCode.getLastToken(node);
      var second = context.getTokenAfter(first);
      var penultimate = sourceCode.getTokenBefore(last);
      var third = context.getTokenAfter(second);
      var antepenultimate = sourceCode.getTokenBefore(penultimate);

      validateBraceSpacing(node, first, second, third, antepenultimate, penultimate, last);
    }
  };
};

module.exports.schema = [{
  enum: ['always', 'never']
}, {
  type: 'object',
  properties: {
    allowMultiline: {
      type: 'boolean'
    },
    alternative: {
      type: 'boolean'
    }
  },
  additionalProperties: false
}];
